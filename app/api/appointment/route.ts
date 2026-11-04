import { validateAppointment } from "@/lib/appointment/validation";

// Runs on the Node.js runtime (default). Route Handlers are not cached for POST.

const MAX_BODY_BYTES = 10 * 1024;
const WEBHOOK_TIMEOUT_MS = 10_000;

// Rate limit: 5 requests per IP per 10 minutes.
// In-memory: each serverless instance keeps its own counters, so this is a
// best-effort guard. Use a shared store (e.g. Upstash/Vercel KV) for a hard limit.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function checkRateLimit(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(key);
    }
  }

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return { limited: true, retryAfterSec: Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000) };
  }
  recent.push(now);
  hits.set(ip, recent);
  return { limited: false, retryAfterSec: 0 };
}

function getClientIp(request: Request): string {
  // On Vercel these headers are set by the platform and cannot be spoofed by the client.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

type ErrorCode =
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "INVALID_REQUEST"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  extra: { fields?: unknown; headers?: Record<string, string> } = {},
) {
  return json(
    { ok: false, error: { code, message, ...(extra.fields ? { fields: extra.fields } : {}) } },
    status,
    extra.headers,
  );
}

export async function POST(request: Request) {
  const rate = checkRateLimit(getClientIp(request));
  if (rate.limited) {
    return errorResponse(429, "RATE_LIMITED", "Too many requests. Please try again later.", {
      headers: { "Retry-After": String(rate.retryAfterSec) },
    });
  }

  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Could not read the request body.");
  }
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return errorResponse(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body is not valid JSON.");
  }

  // Honeypot: real users never see or fill the "website" field.
  if (typeof body === "object" && body !== null && "website" in body) {
    const website = (body as Record<string, unknown>).website;
    if (website !== undefined && website !== null && website !== "") {
      return errorResponse(400, "INVALID_REQUEST", "Invalid request.");
    }
  }

  const result = validateAppointment(body);
  if (!result.ok) {
    return errorResponse(422, "VALIDATION_ERROR", "Please correct the highlighted fields.", {
      fields: result.errors,
    });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    console.error("[api/appointment] N8N_WEBHOOK_URL or N8N_WEBHOOK_SECRET is not configured");
    return errorResponse(500, "SERVER_ERROR", "We could not submit your enquiry right now.");
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify(result.data),
      cache: "no-store",
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      // Status only: never log the URL, secret or any patient details.
      console.error(`[api/appointment] n8n webhook responded with status ${upstream.status}`);
      return errorResponse(502, "SERVER_ERROR", "We could not submit your enquiry right now.");
    }
  } catch (err) {
    console.error(`[api/appointment] n8n webhook request failed: ${err instanceof Error ? err.name : "unknown error"}`);
    return errorResponse(502, "SERVER_ERROR", "We could not submit your enquiry right now.");
  }

  return json({ ok: true, message: "Thank you! Our team will confirm your appointment shortly." }, 200);
}

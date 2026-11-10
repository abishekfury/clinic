import { buildSystemPrompt } from "@/lib/chatPrompt";
import { clinicKnowledge } from "@/lib/clinicKnowledge";
import {
  TREATMENTS,
  normalizePhone,
  type Treatment,
} from "@/lib/appointment/validation";

// Reminder: Set a monthly spending cap in the Google Cloud billing console to prevent unexpected charges.
// Runs on the Node.js runtime. Route Handlers are not cached for POST.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10 * 1024; // 10 KB limit
const CHAT_TIMEOUT_MS = 15_000; // 15-second strict timeout
const MAX_MESSAGES_COUNT = 12; // Keep max 12 recent messages
const MAX_MESSAGE_CHARACTERS = 500; // 500 characters max per message

// Rate limiting: 20 requests per IP per 10 minutes.
// In-memory Map limit: Each serverless / lambda instance maintains its own memory,
// so counters are reset on cold start and are best-effort per instance.
// For distributed, hard multi-instance limits, use a shared store like Upstash Redis or Vercel KV.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function checkRateLimit(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Prune map if size grows large
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        hits.delete(key);
      }
    }
  }

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    const oldest = recent[0] ?? now;
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000)),
    };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { limited: false, retryAfterSec: 0 };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function getClinicPhone(): string {
  return process.env.NEXT_PUBLIC_CLINIC_PHONE_DISPLAY || clinicKnowledge.phoneDisplay;
}

function friendlyErrorResponse(status: number = 500) {
  const phone = getClinicPhone();
  return Response.json(
    {
      error: `Sorry, I'm having trouble right now. Please call us on ${phone} or use the Book Appointment page.`,
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

interface MessageInput {
  role: "user" | "assistant";
  content: string;
}

const submitAppointmentTool = {
  functionDeclarations: [
    {
      name: "submit_appointment",
      description:
        "Submits a provisional appointment booking request for a patient once all required fields and user contact consent are obtained and confirmed.",
      parameters: {
        type: "OBJECT",
        properties: {
          fullName: {
            type: "STRING",
            description: "Full name of the patient (2-100 characters)",
          },
          phone: {
            type: "STRING",
            description: "10-digit Indian phone or WhatsApp number (e.g. 9876543210)",
          },
          email: {
            type: "STRING",
            description: "Valid email address for appointment confirmation",
          },
          treatment: {
            type: "STRING",
            enum: [...TREATMENTS],
            description: "Dental treatment category requested",
          },
          appointmentDateTime: {
            type: "STRING",
            description:
              "Preferred date and time in Asia/Kolkata timezone, ideally formatted as YYYY-MM-DDTHH:mm or ISO string (e.g. 2026-11-20T10:30)",
          },
          consent: {
            type: "BOOLEAN",
            description:
              "Must be true. Confirmation that the user answered yes to being contacted via email and WhatsApp.",
          },
        },
        required: [
          "fullName",
          "phone",
          "email",
          "treatment",
          "appointmentDateTime",
          "consent",
        ],
      },
    },
  ],
};

// Validate and parse date into M/D/YYYY HH:mm:ss in Asia/Kolkata time
function validateAndFormatAppointmentDate(rawDate: string): { ok: true; formatted: string; iso: string } | { ok: false; error: string } {
  if (!rawDate || typeof rawDate !== "string") {
    return { ok: false, error: "Please provide a preferred appointment date and time." };
  }

  const trimmed = rawDate.trim();
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;

  // Check ISO format YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  // Check M/D/YYYY HH:mm:ss format
  const mdyMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
    hour = Number(isoMatch[4]);
    minute = Number(isoMatch[5]);
    second = isoMatch[6] ? Number(isoMatch[6]) : 0;
  } else if (mdyMatch) {
    month = Number(mdyMatch[1]);
    day = Number(mdyMatch[2]);
    year = Number(mdyMatch[3]);
    hour = Number(mdyMatch[4]);
    minute = Number(mdyMatch[5]);
    second = mdyMatch[6] ? Number(mdyMatch[6]) : 0;
  } else {
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      return { ok: false, error: "Please specify a valid appointment date and time (e.g. 2026-11-20T10:00)." };
    }
    const istDate = new Date(parsed.getTime() + IST_OFFSET_MS);
    year = istDate.getUTCFullYear();
    month = istDate.getUTCMonth() + 1;
    day = istDate.getUTCDate();
    hour = istDate.getUTCHours();
    minute = istDate.getUTCMinutes();
    second = istDate.getUTCSeconds();
  }

  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const nowWall = Date.now() + IST_OFFSET_MS;

  if (wall <= nowWall) {
    return { ok: false, error: "Appointment date and time must be in the future." };
  }
  if (wall - nowWall > 365 * DAY_MS) {
    return { ok: false, error: "Appointment date must be within the next 365 days." };
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatted = `${month}/${day}/${year} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
  const iso = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;

  return { ok: true, formatted, iso };
}

// Submits the appointment using existing logic (n8n webhook or /api/appointment)
async function submitAppointmentData(
  payload: {
    fullName: string;
    phone: string;
    email: string;
    treatment: Treatment;
    appointmentDateTime: string;
    isoDateTime: string;
    consent: true;
  },
  request: Request
): Promise<{ ok: boolean; message: string }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  // 1. Direct forwarding to n8n webhook if configured
  if (webhookUrl && webhookSecret) {
    try {
      const upstream = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": webhookSecret,
        },
        body: JSON.stringify({
          fullName: payload.fullName,
          phone: payload.phone,
          email: payload.email,
          treatment: payload.treatment,
          appointmentDateTime: payload.appointmentDateTime, // M/D/YYYY HH:mm:ss, Asia/Kolkata
          consent: true,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (upstream.ok) {
        return { ok: true, message: "Appointment request submitted successfully." };
      }
      console.error(`[api/chat] n8n webhook responded with status ${upstream.status}`);
    } catch (err) {
      console.error(`[api/chat] n8n webhook failed: ${err instanceof Error ? err.name : "unknown error"}`);
    }
  }

  // 2. Fallback: Call local /api/appointment route
  try {
    const origin = new URL(request.url).origin;
    const clientIp = getClientIp(request);
    const localRes = await fetch(`${origin}/api/appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": clientIp,
      },
      body: JSON.stringify({
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        treatment: payload.treatment,
        appointmentDateTime: payload.isoDateTime,
        consent: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (localRes.ok) {
      return { ok: true, message: "Appointment request submitted successfully." };
    }
    console.error(`[api/chat] /api/appointment fallback responded with status ${localRes.status}`);
  } catch (err) {
    console.error(`[api/chat] /api/appointment fallback failed: ${err instanceof Error ? err.name : "unknown error"}`);
  }

  return { ok: false, message: "Failed to submit appointment request to upstream service." };
}

export async function POST(request: Request) {
  // 1. Rate limiting
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(clientIp);
  if (rate.limited) {
    const phone = getClinicPhone();
    return Response.json(
      {
        error: `Too many requests. Please wait ${rate.retryAfterSec} seconds, or call us at ${phone}.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSec),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // 2. Content-Type check
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 3. Payload size check
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json(
      { error: "Could not read the request body." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return Response.json(
      { error: "Request body is too large. Max 10 KB allowed." },
      { status: 413, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 4. JSON parsing and structure validation
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: "Request body is not valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (
    typeof parsedBody !== "object" ||
    parsedBody === null ||
    !("messages" in parsedBody) ||
    !Array.isArray((parsedBody as Record<string, unknown>).messages)
  ) {
    return Response.json(
      { error: "Invalid request. Must provide { messages: [...] }." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rawMessages = (parsedBody as { messages: unknown[] }).messages;
  if (rawMessages.length === 0) {
    return Response.json(
      { error: "Messages array cannot be empty." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Strictly validate each message
  const validatedMessages: MessageInput[] = [];
  for (const m of rawMessages) {
    if (typeof m !== "object" || m === null) {
      return Response.json({ error: "Invalid message format." }, { status: 400 });
    }
    const role = (m as Record<string, unknown>).role;
    const content = (m as Record<string, unknown>).content;

    if (role !== "user" && role !== "assistant") {
      return Response.json({ error: "Role must be 'user' or 'assistant'." }, { status: 400 });
    }
    if (typeof content !== "string") {
      return Response.json({ error: "Message content must be a string." }, { status: 400 });
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return Response.json({ error: "Message content cannot be empty." }, { status: 400 });
    }
    if (trimmed.length > MAX_MESSAGE_CHARACTERS) {
      return Response.json(
        { error: `Message exceeds maximum allowed length of ${MAX_MESSAGE_CHARACTERS} characters.` },
        { status: 400 }
      );
    }

    validatedMessages.push({ role, content: trimmed });
  }

  // Max 12 messages kept (drop older)
  const windowedMessages = validatedMessages.slice(-MAX_MESSAGES_COUNT);

  // 5. Check environment variables
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[api/chat] Missing AI_API_KEY in environment variables. Please configure AI_API_KEY in Vercel Project Settings.");
    return friendlyErrorResponse(500);
  }

  // Models to attempt: user override (if provided) -> standard stable Flash models
  const candidateModels = process.env.AI_MODEL
    ? [process.env.AI_MODEL.trim(), "gemini-1.5-flash", "gemini-2.0-flash"]
    : ["gemini-1.5-flash", "gemini-2.0-flash"];

  // 6. Build system prompt & Gemini contents
  const systemPrompt = buildSystemPrompt(clinicKnowledge);

  const geminiContents = windowedMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    let geminiResponse: Response | null = null;
    let selectedModel = candidateModels[0];

    // Try candidate models in order (handles potential 404s if a model identifier is deprecated or region-locked)
    for (const m of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiContents,
          tools: [submitAppointmentTool],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          },
        }),
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
        cache: "no-store",
      });

      if (res.ok) {
        geminiResponse = res;
        selectedModel = m;
        break;
      }

      const errText = await res.text().catch(() => "");
      console.error(`[api/chat] Gemini model '${m}' failed with status ${res.status}: ${errText.slice(0, 150)}`);

      // Only continue to fallback model if 404 (model not found)
      if (res.status !== 404) {
        geminiResponse = res;
        selectedModel = m;
        break;
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.error(`[api/chat] Gemini API error: all candidate models failed`);
      return friendlyErrorResponse(500);
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiData = await geminiResponse.json();
    const candidate = geminiData.candidates?.[0];
    const candidateParts = candidate?.content?.parts ?? [];

    // Check if the model attempted a function call
    type FunctionCallPart = { functionCall: { name: string; args: Record<string, unknown> } };
    const funcCallPart = candidateParts.find(
      (p: unknown): p is FunctionCallPart =>
        typeof p === "object" && p !== null && "functionCall" in p
    );

    if (funcCallPart && funcCallPart.functionCall.name === "submit_appointment") {
      const callArgs = funcCallPart.functionCall.args || {};

      // Verify rule: Check if already submitted in this conversation
      const alreadySubmitted = windowedMessages.some(
        (m) =>
          m.role === "assistant" &&
          (m.content.toLowerCase().includes("appointment request submitted") ||
            m.content.toLowerCase().includes("confirmed shortly by our team") ||
            m.content.toLowerCase().includes("team will confirm your appointment"))
      );

      let toolResult: { ok: boolean; error?: string; message?: string };

      if (alreadySubmitted) {
        toolResult = {
          ok: false,
          error:
            "An appointment request has already been submitted in this conversation. Only one submission is permitted per session.",
        };
      } else {
        // Verify rule: "Never submit unless the user has explicitly said yes to being contacted in the last user message."
        const lastUserMessage = windowedMessages
          .filter((m) => m.role === "user")
          .slice(-1)[0]?.content || "";

        const explicitConsentRegex =
          /\b(yes|yeah|yep|sure|ok|okay|agree|consent|confirm|proceed|correct|fine|ha|haan|sari|aam|yes please|i agree)\b/i;
        const hasExplicitConsentInLastMsg = explicitConsentRegex.test(lastUserMessage);

        if (!hasExplicitConsentInLastMsg) {
          toolResult = {
            ok: false,
            error:
              "Missing explicit contact consent in user's latest response. Ask the user: 'May our team contact you by email and WhatsApp about this enquiry?' and obtain an explicit confirmation before submitting.",
          };
        } else {
          // Validate arguments
          const fullName = typeof callArgs.fullName === "string" ? callArgs.fullName.trim() : "";
          const phone = normalizePhone(typeof callArgs.phone === "string" ? callArgs.phone : "");
          const email = typeof callArgs.email === "string" ? callArgs.email.trim().toLowerCase() : "";
          const treatment = typeof callArgs.treatment === "string" ? callArgs.treatment.trim() : "";
          const rawDate = typeof callArgs.appointmentDateTime === "string" ? callArgs.appointmentDateTime : "";
          const consent = callArgs.consent === true;

          if (fullName.length < 2 || fullName.length > 100) {
            toolResult = {
              ok: false,
              error: "Invalid fullName: Full name must be between 2 and 100 characters.",
            };
          } else if (!PHONE_PATTERN.test(phone)) {
            toolResult = {
              ok: false,
              error: "Invalid phone: Enter a valid 10-digit Indian mobile number starting with 6-9.",
            };
          } else if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
            toolResult = {
              ok: false,
              error: "Invalid email: Please provide a valid email address.",
            };
          } else if (!TREATMENTS.includes(treatment as Treatment)) {
            toolResult = {
              ok: false,
              error: `Invalid treatment: Must be one of [${TREATMENTS.join(", ")}].`,
            };
          } else if (!consent) {
            toolResult = {
              ok: false,
              error: "Invalid consent: Consent must be explicitly true.",
            };
          } else {
            const dateCheck = validateAndFormatAppointmentDate(rawDate);
            if (!dateCheck.ok) {
              toolResult = { ok: false, error: `Invalid appointmentDateTime: ${dateCheck.error}` };
            } else {
              // Submit appointment through backend pipeline
              const submission = await submitAppointmentData(
                {
                  fullName,
                  phone,
                  email,
                  treatment: treatment as Treatment,
                  appointmentDateTime: dateCheck.formatted,
                  isoDateTime: dateCheck.iso,
                  consent: true,
                },
                request
              );

              if (submission.ok) {
                toolResult = {
                  ok: true,
                  message: `Appointment request submitted successfully for ${fullName} (${treatment}) on ${dateCheck.formatted}. Our team will contact them on WhatsApp or email to confirm.`,
                };
              } else {
                toolResult = {
                  ok: false,
                  error: "Temporary backend error submitting appointment. Advise patient to call the clinic.",
                };
              }
            }
          }
        }
      }

      // Second turn: pass tool execution response back to Gemini to produce final polite response
      const followupContents = [
        ...geminiContents,
        {
          role: "model",
          parts: [{ functionCall: funcCallPart.functionCall }],
        },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: "submit_appointment",
                response: toolResult,
              },
            },
          ],
        },
      ];

      const followupResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: followupContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          },
        }),
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
        cache: "no-store",
      });

      if (!followupResponse.ok) {
        console.error(`[api/chat] Gemini follow-up error status: ${followupResponse.status}`);
        if (toolResult.ok) {
          // If the appointment succeeded, ensure the patient gets confirmation
          return Response.json(
            {
              message:
                "Thank you! Your appointment request has been submitted. Our team will contact you on WhatsApp or email shortly to confirm your slot.",
            },
            { status: 200 }
          );
        }
        return friendlyErrorResponse(500);
      }

      const followupData = await followupResponse.json();
      const followupText = followupData.candidates?.[0]?.content?.parts?.[0]?.text;

      return Response.json(
        {
          message:
            followupText?.trim() ||
            (toolResult.ok
              ? "Thank you! Your appointment request has been submitted. Our team will contact you shortly to confirm."
              : `I couldn't submit your booking: ${toolResult.error}`),
        },
        { status: 200 }
      );
    }

    // Standard text response
    const replyText = candidateParts.find((p: unknown) => typeof p === "object" && p !== null && "text" in p)?.text;
    if (!replyText || typeof replyText !== "string") {
      return friendlyErrorResponse(500);
    }

    return Response.json(
      { message: replyText.trim() },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error(`[api/chat] Execution error: ${err instanceof Error ? err.name : "UnknownError"}`);
    return friendlyErrorResponse(500);
  }
}

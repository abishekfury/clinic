/**
 * Appointment enquiry validation, shared by the form (browser) and the
 * /api/appointment route (server). The server is the source of truth.
 *
 * Dates: the browser's datetime-local input gives a wall-clock string such as
 * "2026-11-06T10:00" with no time zone. We always treat it as Asia/Kolkata
 * time and do the maths on its components, so results never depend on the
 * time zone of the browser or the server.
 */

export const TREATMENTS = [
  "Root canal",
  "Wisdom tooth removal",
  "Implants",
  "Braces",
  "Cleaning",
  "Other",
] as const;

export type Treatment = (typeof TREATMENTS)[number];

export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  maxDaysAhead: 365,
} as const;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const DATETIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

export interface AppointmentInput {
  fullName: string;
  phone: string;
  email: string;
  treatment: string;
  /** datetime-local value, e.g. "2026-11-06T10:00" (Asia/Kolkata wall time). */
  appointmentDateTime: string;
  consent: boolean;
}

/** Exactly what is forwarded to n8n. */
export interface AppointmentPayload {
  fullName: string;
  phone: string;
  email: string;
  treatment: Treatment;
  /** M/D/YYYY HH:mm:ss, Asia/Kolkata. */
  appointmentDateTime: string;
  consent: true;
}

export type AppointmentField = keyof AppointmentInput;
export type AppointmentErrors = Partial<Record<AppointmentField, string>>;

export type AppointmentResult =
  | { ok: true; data: AppointmentPayload }
  | { ok: false; errors: AppointmentErrors };

const pad = (n: number) => String(n).padStart(2, "0");

/** Removes spaces/dashes and an optional +91 / 91 prefix. */
export function normalizePhone(value: string): string {
  const compact = value.replace(/[\s-]/g, "");
  const match = /^(?:\+91|91)(\d{10})$/.exec(compact);
  return match ? match[1] : compact;
}

/** Current Asia/Kolkata time as a datetime-local string, for the `min` attribute. */
export function nowInKolkataInputValue(): string {
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

type DateCheck =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

function checkDateTime(value: string): DateCheck {
  const match = DATETIME_PATTERN.exec(value);
  if (!match) return { ok: false, error: "Please choose a valid date and time." };

  const [year, month, day, hour, minute, second] = match.slice(1).map((p) => (p === undefined ? 0 : Number(p)));
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(wall);
  const isRealDate =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    check.getUTCHours() === hour &&
    check.getUTCMinutes() === minute &&
    check.getUTCSeconds() === second;
  if (!isRealDate) return { ok: false, error: "Please choose a valid date and time." };

  const nowWall = Date.now() + IST_OFFSET_MS;
  if (wall <= nowWall) return { ok: false, error: "Please choose a date and time in the future." };
  if (wall - nowWall > LIMITS.maxDaysAhead * DAY_MS) {
    return { ok: false, error: "Please choose a date within the next year." };
  }

  return {
    ok: true,
    formatted: `${month}/${day}/${year} ${pad(hour)}:${pad(minute)}:${pad(second)}`,
  };
}

/** Validates untrusted input (the parsed JSON body or the form state). */
export function validateAppointment(input: unknown): AppointmentResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: { fullName: "Request body must be a JSON object." } };
  }

  const raw = input as Record<string, unknown>;
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const errors: AppointmentErrors = {};

  const fullName = text(raw.fullName).replace(CONTROL_CHARS, "").replace(/\s+/g, " ");
  if (fullName.length < LIMITS.nameMin) errors.fullName = "Please enter your full name.";
  else if (fullName.length > LIMITS.nameMax) errors.fullName = `Name must be at most ${LIMITS.nameMax} characters.`;

  const phone = normalizePhone(text(raw.phone));
  if (!text(raw.phone)) errors.phone = "Please enter your WhatsApp number.";
  else if (!PHONE_PATTERN.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210).";

  const email = text(raw.email).toLowerCase();
  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid email address.";

  const treatment = text(raw.treatment);
  if (!treatment) errors.treatment = "Please select a treatment.";
  else if (!(TREATMENTS as readonly string[]).includes(treatment)) errors.treatment = "Please select a valid treatment.";

  let formattedDate = "";
  const dateValue = text(raw.appointmentDateTime);
  if (!dateValue) {
    errors.appointmentDateTime = "Please choose a preferred date and time.";
  } else {
    const result = checkDateTime(dateValue);
    if (result.ok) formattedDate = result.formatted;
    else errors.appointmentDateTime = result.error;
  }

  if (raw.consent !== true) errors.consent = "Please tick the box so we can contact you about your enquiry.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      fullName,
      phone,
      email,
      treatment: treatment as Treatment,
      appointmentDateTime: formattedDate,
      consent: true,
    },
  };
}

// Shown as the fallback contact if the enquiry cannot be submitted.
// Defaults to the number already used by the Hero call button; override it in the environment.
export const CLINIC_PHONE_DISPLAY = process.env.NEXT_PUBLIC_CLINIC_PHONE_DISPLAY || "+1 555 123 4567";
export const CLINIC_PHONE_TEL = `tel:${CLINIC_PHONE_DISPLAY.replace(/[^\d+]/g, "")}`;

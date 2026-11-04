"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import {
  TREATMENTS,
  nowInKolkataInputValue,
  validateAppointment,
  type AppointmentErrors,
  type AppointmentField,
} from "@/lib/appointment/validation";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from "@/lib/clinic";

const EMPTY = {
  fullName: "",
  phone: "",
  email: "",
  treatment: "",
  appointmentDateTime: "",
  consent: false,
  website: "",
};

type FormState = typeof EMPTY;
type Status = "idle" | "submitting" | "success" | "error";

const FIELD_ORDER: AppointmentField[] = ["fullName", "phone", "email", "treatment", "appointmentDateTime", "consent"];

const inputClass =
  "block w-full px-0 py-3 text-deep-navy bg-transparent border-0 border-b border-deep-navy/20 rounded-none appearance-none focus:outline-none focus:ring-0 focus:border-premium-teal transition-colors aria-[invalid=true]:border-red-600";
const labelClass = "block text-sm font-medium text-deep-navy/70 mb-1";
const errorClass = "mt-1 text-sm text-red-600";

export default function AppointmentForm() {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<AppointmentErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Set client-side so the minimum is "now" in Kolkata, not the build time.
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = nowInKolkataInputValue();
  }, []);

  const isSubmitting = status === "submitting";

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateField = (field: AppointmentField) => {
    const result = validateAppointment(values);
    setErrors((prev) => ({ ...prev, [field]: result.ok ? undefined : result.errors[field] }));
  };

  const focusFirstError = (errs: AppointmentErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const result = validateAppointment(values);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("idle");
      setErrorMessage("");
      focusFirstError(result.errors);
      return;
    }

    setErrors({});
    setErrorMessage("");
    setStatus("submitting");

    const fallback = `Sorry, we couldn't send your enquiry. Please call us at ${CLINIC_PHONE_DISPLAY} and we'll be happy to help.`;
    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
          treatment: values.treatment,
          appointmentDateTime: values.appointmentDateTime,
          consent: values.consent,
          website: values.website,
        }),
      });

      if (response.ok) {
        setValues(EMPTY);
        setStatus("success");
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status === 422 && data?.error?.fields) {
        setErrors(data.error.fields as AppointmentErrors);
        setStatus("idle");
        focusFirstError(data.error.fields);
        return;
      }

      setErrorMessage(
        response.status === 429
          ? `You've sent several requests in a short time. Please try again in a little while, or call us at ${CLINIC_PHONE_DISPLAY}.`
          : fallback,
      );
      setStatus("error");
    } catch {
      setErrorMessage(fallback);
      setStatus("error");
    }
  };

  const describedBy = (field: AppointmentField) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6" aria-busy={isSubmitting}>
      <div>
        <label htmlFor="fullName" className={labelClass}>Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          className={inputClass}
          value={values.fullName}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={describedBy("fullName")}
          onChange={(e) => setField("fullName", e.target.value)}
          onBlur={() => values.fullName && validateField("fullName")}
        />
        {errors.fullName && <p id="fullName-error" className={errorClass}>{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Phone number (WhatsApp)</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="9876543210"
          className={inputClass}
          value={values.phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone")}
          onChange={(e) => setField("phone", e.target.value)}
          onBlur={() => values.phone && validateField("phone")}
        />
        {errors.phone && <p id="phone-error" className={errorClass}>{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className={inputClass}
          value={values.email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          onChange={(e) => setField("email", e.target.value)}
          onBlur={() => values.email && validateField("email")}
        />
        {errors.email && <p id="email-error" className={errorClass}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="treatment" className={labelClass}>Treatment needed</label>
        <select
          id="treatment"
          name="treatment"
          required
          className={inputClass}
          value={values.treatment}
          aria-invalid={errors.treatment ? true : undefined}
          aria-describedby={describedBy("treatment")}
          onChange={(e) => setField("treatment", e.target.value)}
        >
          <option value="" disabled>Select a treatment</option>
          {TREATMENTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.treatment && <p id="treatment-error" className={errorClass}>{errors.treatment}</p>}
      </div>

      <div>
        <label htmlFor="appointmentDateTime" className={labelClass}>Preferred appointment date and time</label>
        <input
          ref={dateRef}
          id="appointmentDateTime"
          name="appointmentDateTime"
          type="datetime-local"
          required
          className={inputClass}
          value={values.appointmentDateTime}
          aria-invalid={errors.appointmentDateTime ? true : undefined}
          aria-describedby={describedBy("appointmentDateTime")}
          onChange={(e) => setField("appointmentDateTime", e.target.value)}
        />
        {errors.appointmentDateTime && (
          <p id="appointmentDateTime-error" className={errorClass}>{errors.appointmentDateTime}</p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-5 w-5 shrink-0 rounded border-deep-navy/30 accent-premium-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal focus-visible:ring-offset-2"
            checked={values.consent}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describedBy("consent")}
            onChange={(e) => setField("consent", e.target.checked)}
          />
          <label htmlFor="consent" className="text-sm text-deep-navy/70 font-light">
            I agree to be contacted about my enquiry. See our{" "}
            <Link href="/privacy-policy" className="font-medium text-premium-teal underline underline-offset-2 hover:text-deep-navy">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.consent && <p id="consent-error" className={errorClass}>{errors.consent}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-deep-navy text-soft-white text-base font-medium hover:bg-deep-navy/90 transition-all hover:shadow-xl hover:shadow-deep-navy/20 group focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isSubmitting ? (
            <>
              Sending...
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
            </>
          ) : (
            <>
              Request Appointment
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {/* Live regions are always rendered so screen readers announce changes. */}
      <div className="min-h-6 text-sm">
        <p role="status" aria-live="polite" className="text-premium-teal font-medium">
          {status === "success" ? "Thank you! Our team will confirm your appointment shortly." : ""}
        </p>
        <p role="alert" className="text-red-600">
          {status === "error" ? errorMessage : ""}
          {status === "error" && (
            <>
              {" "}
              <a href={CLINIC_PHONE_TEL} className="font-medium underline underline-offset-2">Call {CLINIC_PHONE_DISPLAY}</a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}

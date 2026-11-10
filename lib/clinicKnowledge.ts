/**
 * Clinic facts and knowledge base for The Dental Hub Family Dental Hospital.
 * This is the SINGLE SOURCE OF TRUTH for the AI assistant.
 * 
 * Update these values whenever clinic details change.
 * Facts are injected into the runtime system prompt (lib/chatPrompt.ts).
 */

export const clinicKnowledge = {
  name: "The Dental Hub Family Dental Hospital",
  shortName: "The Dental Hub",
  address: "The Dental Hub, Nellikuppam Rd, Pankaja Ammal Nagar, Guduvancheri, Tamil Nadu 603202",
  mapsLink: null as string | null, // add the real Google Maps link
  phoneDisplay: "080561 38826", // confirm with clinic
  phoneTel: "+918056138826", // digits only for tel: links
  whatsappNumber: null as string | null, // e.g. "919XXXXXXXXX" once the clinic has one
  email: null as string | null,
  hours: [
    // SAMPLE ONLY. Replace with the clinic's real hours. Google showed "Opens 5 pm" on one day.
    { days: "Monday to Saturday", time: "5:00 PM to 9:00 PM" },
    { days: "Sunday", time: "Please call to confirm" },
  ],
  services: [
    // Only list services the clinic approves.
    {
      name: "Root canal treatment",
      info: "Treatment to save a tooth with an infected or damaged nerve. A dentist must examine you first.",
    },
    {
      name: "Wisdom tooth removal",
      info: "Assessment and removal of wisdom teeth when needed. A dentist decides after examination.",
    },
    {
      name: "Dental implants",
      info: "Replacement of missing teeth. Suitability is decided after consultation.",
    },
    {
      name: "Braces",
      info: "Teeth alignment treatment. Duration and type are decided after consultation.",
    },
    {
      name: "Teeth cleaning",
      info: "Professional cleaning of teeth and gums.",
    },
  ],
  allowedTreatments: [
    "Root canal",
    "Wisdom tooth removal",
    "Implants",
    "Braces",
    "Cleaning",
    "Other",
  ] as const,
  booking: {
    howItWorks:
      "Patients can send an appointment request on the Book Appointment page or through this chat. Our team confirms the slot by email or WhatsApp.",
    confirmationNote: "A request is not a confirmed appointment until our team confirms it.",
    advanceNotice: null as string | null, // e.g. "Please book at least 1 day ahead" if the clinic says so
  },
  languages: ["English", "Tamil"] as const, // confirm with clinic
  emergency: {
    message:
      "For severe pain, facial swelling, uncontrolled bleeding, fever with dental pain, or injury, please call us immediately or go to the nearest hospital emergency department.",
    afterHoursNote: null as string | null,
  },
  whatToBring: null as string | null, // e.g. previous X-rays or prescriptions, if the clinic wants that said
  doNotMention: [
    "prices or estimates",
    "discounts or free consultations",
    "doctor names or qualifications (unless provided and approved)",
    "success rates or guarantees",
    "reviews or ratings",
  ] as const,
  faq: [
    // SAMPLE ONLY. Keep answers safe, short and approved by the clinic.
    {
      q: "Do I need an appointment?",
      a: "Appointments are recommended. You can send a request on our Book Appointment page and our team will confirm the time.",
    },
    {
      q: "How do I reach the clinic?",
      a: "You can call us on 080561 38826 during clinic hours, or use the Book Appointment page.",
    },
    {
      q: "Is the treatment painful?",
      a: "Our dentists explain the procedure and comfort options during consultation. Please book a visit to discuss this.",
    },
  ],
};

export type ClinicKnowledge = typeof clinicKnowledge;

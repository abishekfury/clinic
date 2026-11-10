"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import { clinicKnowledge } from "@/lib/clinicKnowledge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    role: "assistant",
    content:
      "Hi! I'm the clinic's virtual assistant. I'm an AI, not a doctor. How can I help?",
  },
];

const MAX_CHARS = 500;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const phoneDisplay =
    process.env.NEXT_PUBLIC_CLINIC_PHONE_DISPLAY || clinicKnowledge.phoneDisplay;
  const clinicPhoneTel = clinicKnowledge.phoneTel.startsWith("tel:")
    ? clinicKnowledge.phoneTel
    : `tel:${clinicKnowledge.phoneTel}`;
  const whatsappUrl = clinicKnowledge.whatsappNumber
    ? `https://wa.me/${clinicKnowledge.whatsappNumber}`
    : null;

  // Auto-scroll to bottom on new messages or loading state change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus management and trap when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Focus the textarea after opening
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      const handleTrapFocus = (e: KeyboardEvent) => {
        if (!dialogRef.current || e.key !== "Tab") return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      window.addEventListener("keydown", handleTrapFocus);
      return () => window.removeEventListener("keydown", handleTrapFocus);
    } else {
      // Restore focus to floating trigger button when closed
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  // Send message to /api/chat
  const sendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // Send max 12 recent messages
      const payload = {
        messages: newHistory.slice(-12).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errMsg =
          data?.error ||
          `Sorry, I'm having trouble right now. Please call us on ${phoneDisplay} or use the Book Appointment page.`;
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: errMsg,
          },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content:
            data.message ||
            `For any questions, please call us directly on ${phoneDisplay}.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I'm having trouble right now. Please call us on ${phoneDisplay} or use the Book Appointment page.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick reply chip handler
  const handleQuickReply = (label: string) => {
    if (label === "Talk to a person") {
      // Local immediate response without hitting the AI endpoint
      const hoursText = clinicKnowledge.hours[0]
        ? `${clinicKnowledge.hours[0].days} (${clinicKnowledge.hours[0].time})`
        : "Monday to Saturday";
      const contactText = whatsappUrl
        ? `You can reach our team directly by phone at ${clinicPhoneTel} or message us on WhatsApp at ${whatsappUrl}. We're available ${hoursText}.`
        : `You can reach our team directly by phone at ${clinicPhoneTel}. We're available ${hoursText}.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: "Talk to a person",
        },
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: contactText,
        },
      ]);
      return;
    }

    if (label === "Book appointment") {
      sendMessage("I would like to book an appointment.");
    } else if (label === "Our services") {
      sendMessage("What dental treatments and services do you offer?");
    } else if (label === "Timings and location") {
      sendMessage("What are your clinic timings and location address?");
    }
  };

  // Safe message text renderer: plain text + auto-linking tel: and https://wa.me
  const renderMessageContent = (text: string) => {
    // Regex matches tel: links, wa.me links, or standard phone numbers we format
    const linkRegex = /(tel:[+0-9\s-]+|https:\/\/wa\.me\/[0-9]+)/g;
    const parts = text.split(linkRegex);

    return parts.map((part, index) => {
      if (part.startsWith("tel:")) {
        return (
          <a
            key={index}
            href={part}
            className="inline-flex items-center gap-1 font-semibold text-premium-teal underline decoration-2 underline-offset-2 hover:text-deep-navy focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-premium-teal rounded px-0.5"
          >
            <Phone size={13} className="inline shrink-0" aria-hidden="true" />
            {part.replace("tel:", "")}
          </a>
        );
      }
      if (part.startsWith("https://wa.me/")) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-premium-teal underline decoration-2 underline-offset-2 hover:text-deep-navy focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-premium-teal rounded px-0.5"
          >
            <MessageCircle size={13} className="inline shrink-0" aria-hidden="true" />
            WhatsApp
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating round launcher button (stacked neatly on bottom-right) */}
      {!isOpen && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat assistant"
          aria-haspopup="dialog"
          aria-expanded="false"
          className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-deep-navy text-soft-white shadow-xl hover:bg-deep-navy/90 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal focus-visible:ring-offset-2"
        >
          <MessageSquare className="w-6 h-6 text-soft-white" aria-hidden="true" />
          <span className="sr-only">Open chat assistant</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-premium-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-premium-teal" />
          </span>
        </button>
      )}

      {/* Chat dialog panel */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Clinic virtual assistant chat"
          className="fixed inset-0 z-50 flex flex-col bg-warm-beige md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[600px] md:max-h-[calc(100vh-3rem)] md:rounded-3xl shadow-2xl md:border md:border-deep-navy/10 overflow-hidden font-sans"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 bg-deep-navy text-soft-white border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-premium-teal flex items-center justify-center text-soft-white font-bold text-sm shadow-inner">
                <Sparkles size={18} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight text-soft-white">
                  Virtual assistant (AI)
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-soft-white/70">Online • The Dental Hub</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="Close chat window"
              className="p-2 rounded-full text-soft-white/70 hover:text-soft-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-white"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          {/* Quick reply chips */}
          <div className="px-4 py-2.5 bg-warm-beige border-b border-deep-navy/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => handleQuickReply("Book appointment")}
              className="whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full bg-white text-deep-navy border border-deep-navy/15 hover:bg-deep-navy hover:text-soft-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal"
            >
              📅 Book appointment
            </button>
            <button
              type="button"
              onClick={() => handleQuickReply("Our services")}
              className="whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full bg-white text-deep-navy border border-deep-navy/15 hover:bg-deep-navy hover:text-soft-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal"
            >
              🦷 Our services
            </button>
            <button
              type="button"
              onClick={() => handleQuickReply("Timings and location")}
              className="whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full bg-white text-deep-navy border border-deep-navy/15 hover:bg-deep-navy hover:text-soft-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal"
            >
              📍 Timings & location
            </button>
            <button
              type="button"
              onClick={() => handleQuickReply("Talk to a person")}
              className="whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full bg-premium-teal/10 text-premium-teal border border-premium-teal/30 hover:bg-premium-teal hover:text-soft-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal"
            >
              👤 Talk to a person
            </button>
          </div>

          {/* Messages list with auto-scroll and live region */}
          <div
            aria-live="polite"
            className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-warm-beige text-deep-navy text-sm leading-relaxed"
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-deep-navy text-soft-white rounded-tr-xs shadow-md"
                        : "bg-white text-deep-navy border border-deep-navy/10 rounded-tl-xs shadow-sm"
                    }`}
                  >
                    {renderMessageContent(m.content)}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-deep-navy border border-deep-navy/10 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-premium-teal" />
                  <span className="text-xs text-deep-navy/60">Typing reply...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="p-3 bg-white border-t border-deep-navy/10 shrink-0">
            <div className="relative flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or request an appointment..."
                aria-label="Your message"
                rows={1}
                maxLength={MAX_CHARS}
                disabled={isLoading}
                className="w-full pl-3.5 pr-12 py-2.5 text-sm bg-warm-beige rounded-2xl border border-deep-navy/20 text-deep-navy placeholder:text-deep-navy/40 focus:outline-none focus:border-premium-teal focus:ring-1 focus:ring-premium-teal resize-none disabled:opacity-60 transition-colors"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="absolute right-2 p-2 rounded-full bg-deep-navy text-soft-white hover:bg-deep-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-teal"
              >
                <Send size={15} aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-deep-navy/50">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className={input.length >= 450 ? "text-amber-700 font-semibold" : ""}>
                {input.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <footer className="px-4 py-2 bg-warm-beige/80 border-t border-deep-navy/5 text-center text-[11px] text-deep-navy/70 shrink-0">
            AI assistant. Not medical advice. For emergencies call{" "}
            <a
              href={clinicPhoneTel}
              className="font-medium text-premium-teal underline underline-offset-2 hover:text-deep-navy focus-visible:ring-1 focus-visible:ring-premium-teal"
            >
              {phoneDisplay}
            </a>
            . See{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-premium-teal underline underline-offset-2 hover:text-deep-navy focus-visible:ring-1 focus-visible:ring-premium-teal"
            >
              Privacy Policy
            </Link>
            .
          </footer>
        </div>
      )}
    </>
  );
}

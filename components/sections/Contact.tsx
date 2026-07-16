"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ContactData } from "@/types";
import { insertMessage } from "@/lib/supabase/messages";

interface ContactProps {
  data: ContactData;
}

export default function Contact({ data }: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), 3500);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: typeof errors = {};

      if (!name.trim()) newErrors.name = "Name is required";
      if (!email.trim()) newErrors.email = "Email is required";
      else if (!isValidEmail(email.trim())) newErrors.email = "Please enter a valid email";
      if (!message.trim()) newErrors.message = "Message is required";

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setSubmitting(true);

      insertMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "Contact Form Submission",
        message: message.trim(),
      })
        .then(() => {
          setName("");
          setEmail("");
          setMessage("");
          setSubject("");
          setErrors({});
          showToast("Message submitted successfully.");
        })
        .catch(() => {
          showToast("Failed to send message. Please try again.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [name, email, message, subject, showToast]
  );

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <section className="section" id="sec-5" aria-label="Contact">
      <div className="section-content contact-wrap">
        <div className="section-label" id="dyn-ct-label">{data.label}</div>
        <div className="section-title" id="dyn-ct-title">{data.title}</div>
        <p className="contact-sub" id="dyn-ct-sub">{data.subtitle}</p>
        <a className="contact-email" id="dyn-ct-email" href={`mailto:${data.email}`}>
          {data.email}
        </a>
        <form className="contact-form" id="contactForm" noValidate onSubmit={handleSubmit}>
          <div className="cf-row">
            <div>
              <input
                className={`cf-field${errors.name ? " cf-error" : ""}`}
                id="cf-name"
                type="text"
                placeholder="Your Name"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError("name"); }}
              />
              {errors.name && <div className="cf-error-msg">{errors.name}</div>}
            </div>
            <div>
              <input
                className={`cf-field${errors.email ? " cf-error" : ""}`}
                id="cf-email"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              />
              {errors.email && <div className="cf-error-msg">{errors.email}</div>}
            </div>
          </div>
          <div>
            <textarea
              className={`cf-field${errors.message ? " cf-error" : ""}`}
              id="cf-msg"
              placeholder="Tell me about your project..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); clearError("message"); }}
            />
            {errors.message && <div className="cf-error-msg">{errors.message}</div>}
          </div>
          <button
            className={`btn-glow${submitting ? " cf-btn-disabled" : ""}`}
            id="cf-submit"
            type="submit"
            disabled={submitting}
          >
            <span className="cf-btn-text" style={{ display: submitting ? "none" : "inline" }}>
              Send Message &nbsp;<i className="bi bi-send-fill" />
            </span>
            <span className="cf-btn-loading" style={{ display: submitting ? "inline" : "none" }}>
              <span className="cf-spinner" /> Sending...
            </span>
          </button>
        </form>
        <div className="socials" id="dyn-socials">
          {data.socials.map((s, i) => (
            <a key={i} href={s.url} className="social-btn" title={s.title}>
              <i className={`bi ${s.icon}`} />
            </a>
          ))}
        </div>
      </div>
      {toast && <div className="site-toast show">{toast}</div>}
    </section>
  );
}

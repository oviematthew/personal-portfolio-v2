"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Loader } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldError(name, value) {
  const trimmed = value.trim();
  switch (name) {
    case "fullName":
      if (!trimmed) return "Full name is required.";
      if (trimmed.length < 2) return "Full name is too short.";
      if (trimmed.length > 100) return "Full name is too long.";
      return "";
    case "email":
      if (!trimmed) return "Email is required.";
      if (trimmed.length > 254 || !EMAIL_REGEX.test(trimmed)) {
        return "Enter a valid email address.";
      }
      return "";
    case "message":
      if (!trimmed) return "Message is required.";
      if (trimmed.length < 10) return "Message is too short.";
      if (trimmed.length > 5000) return "Message is too long.";
      return "";
    default:
      return "";
  }
}

export default function ContactForm() {
  const [values, setValues] = useState({ fullName: "", email: "", message: "" });
  const [touched, setTouched] = useState({ fullName: false, email: false, message: false });
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // A ref-based lock, since state updates are async and a fast double click
  // or double Enter-press can fire handleSubmit again before disabled kicks in.
  const submitLockRef = useRef(false);

  const fieldErrors = {
    fullName: getFieldError("fullName", values.fullName),
    email: getFieldError("email", values.email),
    message: getFieldError("message", values.message),
  };
  const hasErrors = Object.values(fieldErrors).some(Boolean);
  const canSubmit = !hasErrors && !!captchaToken && !isSubmitting;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLockRef.current) return;

    setTouched({ fullName: true, email: true, message: true });

    if (hasErrors) return;
    if (!captchaToken) {
      alert("Please complete the reCAPTCHA.");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const fullName = values.fullName.trim();
      const form = new FormData();
      form.set("fullName", fullName);
      form.set("email", values.email.trim());
      form.set("message", values.message.trim());
      form.set("captcha", captchaToken);

      const res = await fetch("/api/contact", {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        setValues({ fullName: "", email: "", message: "" });
        setTouched({ fullName: false, email: false, message: false });
        setCaptchaToken("");
        router.push(`/form-success?fullName=${encodeURIComponent(fullName)}`);
      } else {
        router.push("/form-failed");
      }
    } catch {
      router.push("/form-failed");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const fieldClass = (name) =>
    `w-full px-4 py-3 border focus:outline-none text-white placeholder-gray-500 transition ${
      touched[name] && fieldErrors[name]
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-brand focus:ring-brand"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-xl w-full mt-5">
      <div>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          maxLength={100}
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Full Name"
          aria-invalid={touched.fullName && !!fieldErrors.fullName}
          aria-describedby="fullName-error"
          className={fieldClass("fullName")}
        />
        {touched.fullName && fieldErrors.fullName && (
          <p id="fullName-error" className="mt-1.5 text-sm text-red-400">
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      <div>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Email Address"
          aria-invalid={touched.email && !!fieldErrors.email}
          aria-describedby="email-error"
          className={fieldClass("email")}
        />
        {touched.email && fieldErrors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Your Message"
          rows={6}
          aria-invalid={touched.message && !!fieldErrors.message}
          aria-describedby="message-error"
          className={fieldClass("message")}
        />
        {touched.message && fieldErrors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-red-400">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token || "")}
          className="flex justify-center"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        aria-label="Submit"
        className={`mt-4 inline-flex items-center justify-center w-full px-6 py-3 text-md font-semibold italic transition transform duration-300 ease-in-out ${
          !canSubmit
            ? "bg-gray-500 opacity-60 cursor-not-allowed"
            : "bg-brand hover:bg-brand/90 cursor-pointer hover:scale-95"
        } text-white`}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : "Submit"}
      </button>
    </form>
  );
}

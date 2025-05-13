"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [formCompleted, setFormCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please complete the reCAPTCHA.");
      return;
    }

    const form = new FormData(e.target);
    form.append("captcha", captchaToken);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      e.target.reset();
      setCaptchaToken("");

      const fullName = form.get("fullName") || "";
      router.push(`/form-success?fullName=${encodeURIComponent(fullName)}`);
    } else {
      router.push("/form-failed");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl w-full mt-5">
      <input
        id="fullName"
        name="fullName"
        type="text"
        required
        placeholder="Full Name"
        className="w-full px-4 py-3 border border-gray-300 focus:border-brand focus:ring-brand focus:outline-none text-white placeholder-gray-500 transition"
      />

      <input
        id="email"
        name="email"
        type="email"
        required
        placeholder="Email Address"
        className="w-full px-4 py-3 border border-gray-300 focus:border-brand focus:ring-brand focus:outline-none text-white placeholder-gray-500 transition"
      />

      <textarea
        id="message"
        name="message"
        required
        placeholder="Your Message"
        rows={6}
        className="w-full px-4 py-3 border border-gray-300 focus:border-brand focus:ring-brand focus:outline-none text-white placeholder-gray-500 transition"
      />

      <div className="pt-2">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token || "")}
          className="flex justify-center"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !formCompleted}
        aria-label="Submit"
        className="mt-4 cursor-pointer inline-flex items-center justify-center w-full px-6 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 transition transform hover:scale-95 duration-300 ease-in-out italic"
      >
        {isSubmitting ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}

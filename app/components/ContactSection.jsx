import React from "react";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="px-6 py-12 w-full lg:w-1/2 mx-auto text-white rounded-lg shadow-lg flex items-center justify-center min-h-screen"
    >
      <div className="w-full max-w-xl text-center">
        <h2 className="text-3xl font-bold font-heading mb-4">Get in Touch</h2>

        <p className="text-lg mb-8">
          Get in touch or shoot me an email directly at{" "}
          <a
            href="mailto:hello@oviematthew.com"
            className="text-brand hover:text-brand/90 transition"
          >
            hello@oviematthew.com
          </a>
        </p>

        <ContactForm />
      </div>
    </section>
  );
}

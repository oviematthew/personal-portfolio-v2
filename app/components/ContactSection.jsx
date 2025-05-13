import React from "react";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="px-6 py-12 w-full lg:w-1/2 mx-auto text-white rounded-lg shadow-lg flex items-center justify-center h-[100%]"
    >
      <div className="w-full max-w-xl text-center">
        <h2 className="text-3xl font-bold font-heading mb-4">
          Get in Touch <span className="text-brand">.</span>
        </h2>

        <p className="text-lg mb-8">
          Fill the form below or shoot me an email directly at{" "}
          <a
            href="mailto:hello@oviematthew.com"
            className="text-brand hover:text-brand/90 transition hover:underline"
          >
            hello@oviematthew.com
          </a>{" "}
          or message me on{" "}
          <a
            href="https://www.linkedin.com/in/matthew-ovie-enamuotor-9992b6132/"
            className="text-brand hover:text-brand/90 transition hover:underline"
          >
            linkedin
          </a>
        </p>

        <ContactForm />
      </div>
    </section>
  );
}

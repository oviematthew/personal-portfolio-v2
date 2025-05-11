import Image from "next/image";
import React from "react";

export default function ContactSection() {
  return (
    <>
      <section id="contact" className="px-6 py-30 w-full lg:w-1/2 mx-auto">
        <h2 className="text-3xl font-bold text-white font-heading flex items-center">
          Get in Touch{" "}
          <Image
            src="/media/waving-hand.webp"
            alt="waving hand emoji"
            width={30}
            height={30}
          />
        </h2>
      </section>
    </>
  );
}

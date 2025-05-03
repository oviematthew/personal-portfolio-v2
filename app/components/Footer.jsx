import React from "react";
import {
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import GetCurrentYear from "../utils/GetCurrentYear";

export default function Footer() {
  return (
    <footer className="footer flex flex-col justify-center items-center p-10">
      <Image
        src="/media/footer-icon.png"
        alt="Bedge Pictures logo"
        width={200}
        height={200}
        className="w-25 h-25 object-cover"
        priority
      />

      <div className="footer-links mt-10 flex gap-6">
        <Link
          href="https://www.instagram.com/oviematthew_/"
          target="_blank"
          aria-label="Instagram"
          className="text-white hover:text-brand hover:scale-95 transition duration-300"
        >
          <FaInstagram size={20} />
        </Link>

        <Link
          href="https://x.com/oviematthew_"
          target="_blank"
          aria-label="X (Twitter)"
          className="text-white hover:text-brand hover:scale-95 transition duration-300"
        >
          <FaXTwitter size={20} />
        </Link>

        <Link
          href="https://github.com/oviematthew"
          target="_blank"
          aria-label="GitHub"
          className="text-white hover:text-brand hover:scale-95 transition duration-300"
        >
          <FaGithub size={20} />
        </Link>

        <Link
          href="https://www.linkedin.com/in/oviematthew/"
          target="_blank"
          aria-label="LinkedIn"
          className="text-white hover:text-brand hover:scale-95 transition duration-300"
        >
          <FaLinkedin size={20} />
        </Link>

        <Link
          href="mailto:hello@oviematthew.com"
          aria-label="Email"
          className="text-white hover:text-brand hover:scale-95 transition duration-300"
        >
          <FaEnvelope size={20} />
        </Link>
      </div>

      <p className="copyright text-base text-white text-center mt-5">
        © <GetCurrentYear /> All Rights Reserved.
      </p>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTwitch,
  FaFileLines,
  FaEnvelopeOpenText,
  FaPassport,
  FaCircleUser,
} from "react-icons/fa6";

const REF_CONTENT = {
  github: {
    icon: FaGithub,
    title: "Welcome, fellow developer",
    message:
      "Thanks for stopping by from GitHub. Most of the projects below link straight to their repos, so feel free to dig in.",
  },
  resume: {
    icon: FaFileLines,
    title: "Thanks for checking out my resume",
    message:
      "Take your time looking around. The projects and posts below go a lot deeper than a resume ever could.",
  },
  linkedin: {
    icon: FaLinkedin,
    title: "Thanks for stopping by from LinkedIn",
    message:
      "Have a look around, and feel free to connect. Always happy to talk frontend, mobile, or building with AI tools.",
  },
  immigration: {
    icon: FaPassport,
    title: "Welcome",
    message:
      "If you're reviewing this as supporting material for my immigration application, thanks for taking the time. Everything below is real, actual work.",
  },
  instagram: {
    icon: FaInstagram,
    title: "Thanks for stopping by from Instagram",
    message: "Take a look around at what I've been building lately.",
  },
  coverLetter: {
    icon: FaEnvelopeOpenText,
    title: "Thanks for following the link from my cover letter",
    message: "Hope this gives a good sense of how I actually build things. Take your time.",
  },
  twitch: {
    icon: FaTwitch,
    title: "Thanks for stopping by from Twitch",
    message: "Take a look around at what I've been building lately.",
  },
  youtube: {
    icon: FaYoutube,
    title: "Thanks for stopping by from YouTube",
    message: "Take a look around at what I've been building lately.",
  },
  tiktok: {
    icon: FaTiktok,
    title: "Thanks for stopping by from TikTok",
    message: "Take a look around at what I've been building lately.",
  },
  default: {
    icon: FaCircleUser,
    title: "Welcome",
    message: "Thanks for visiting. Take a look around at what I've been building lately.",
  },
};

export default function RefWelcomeModal() {
  const [ref, setRef] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refValue = params.get("ref");
    if (!refValue) return;

    setRef(refValue);
    setOpen(true);

    fetch("/api/log-ref", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: refValue }),
    }).catch((err) => console.error("Ref logging failed:", err));

    // Drop the ref param from the URL so a refresh or share doesn't retrigger the modal
    params.delete("ref");
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  const content = ref ? REF_CONTENT[ref] ?? REF_CONTENT.default : null;
  const Icon = content?.icon;

  return (
    <AnimatePresence>
      {open && content && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="relative w-full max-w-md bg-[#171717] border border-white/10 rounded-2xl shadow-2xl p-8 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand/15">
              {Icon && <Icon size={26} className="text-brand" />}
            </div>

            <h2 className="text-xl font-bold font-heading text-white mb-3">
              {content.title}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              {content.message}
            </p>

            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-brand-cta hover:bg-brand-cta/90 hover:scale-95 transition duration-300 ease-in-out italic cursor-pointer"
            >
              Take a look around
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

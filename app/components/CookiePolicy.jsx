"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookiePolicy() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("cookieDismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("cookieDismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 mx-auto w-auto max-w-3xl rounded-md bg-black/90 px-6 py-4 shadow-lg backdrop-blur-md sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:transform">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-white leading-snug">
          This site uses cookies for traffic and usage analysis. See my{" "}
          <Link href="/privacy-policy" className="underline hover:text-brand">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          onClick={handleDismiss}
          className="rounded-full p-1.5 hover:bg-white/10 focus:outline-none ring-2 ring-white/40"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// This code defines a CookiePolicy component that displays a cookie consent message at the bottom of the screen.
// It uses local storage to remember if the user has dismissed the message, so it won't show again on subsequent visits. The message includes a link to the privacy policy for more information.

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
    <div className="fixed bottom-3 left-3 right-3 z-50 mx-auto w-auto max-w-lg rounded-md bg-black/90 px-6 py-4 shadow-lg backdrop-blur-md sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:transform sm:px-10 sm:py-6">
      <div className="relative flex items-start gap-x-4">
        <div className="text-sm text-white leading-6">
          <p>
            This site uses cookies for traffic and usage analysis. See my{" "}
            <Link href="/privacy-policy" className="underline hover:text-brand">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute -top-3 -right-4 rounded-full p-1.5 cursor-pointer hover:bg-white/10 focus:outline-none ring-2 ring-white/40"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
// This code defines a CookiePolicy component that displays a cookie consent message at the bottom of the screen.

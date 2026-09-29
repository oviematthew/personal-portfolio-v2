"use client";

import { useEffect } from "react";

// Silent referral tracking: posts the ?ref= value to /api/log-ref (which
// emails the owner for known refs) and strips it from the URL. No UI.
export default function RefTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refValue = params.get("ref");
    if (!refValue) return;

    fetch("/api/log-ref", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: refValue }),
    }).catch((err) => console.error("Ref logging failed:", err));

    params.delete("ref");
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function RefLogger() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;

    fetch("/api/log-ref", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
    })
      .then((res) => res.ok && console.log(`Ref logged: ${ref}`))
      .catch((err) => console.error("Ref logging failed:", err));
  }, []);

  return null; // this component does not render anything
}

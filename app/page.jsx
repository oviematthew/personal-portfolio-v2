"use client";

import { useEffect } from "react";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ProjectsSection from "./components/ProjectsSection";
import BlogSection from "./components/BlogSection";
import SkillsSection from "./components/SkillsSection";
import ContactSection from "./components/ContactSection";

export default function Home() {
  // Log referral information if present in the URL
  // This is useful for tracking where visitors are coming from
  // and can help in understanding the where the traffic is coming from
  //also get the location of the user from the ipapi.co API
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          const location = `${data.country_name}, ${data.city}`;
          fetch("/api/log-ref", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref, location }),
          });
        })
        .catch((err) => {
          console.error("IP location fetch failed:", err);
          // Send without location fallback
          fetch("/api/log-ref", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref }),
          });
        });
    }
  }, []);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}

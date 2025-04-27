"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { ScrollToTop } from "../utils/ScrollToTop";

export default function ScrollToTopBtn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 20);
    };

    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  return (
    <button
      onClick={ScrollToTop}
      className={`fixed z-10 bottom-5 right-5 bg-brand p-3 rounded-full shadow-lg hover:bg-brand-dark hover:cursor-pointer transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } pointer-events-auto`}
    >
      <ArrowUp
        size={24}
        color="white"
        className="transition-colors duration-300"
      />
    </button>
  );
}

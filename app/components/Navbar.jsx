"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // add blur after scrolling 10px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex justify-between lg:justify-around items-center px-10 py-4 transition-all duration-300 ${
        isScrolled
          ? "bg-background/70 backdrop-blur-md shadow-md"
          : "bg-background"
      }`}
    >
      {/* Logo */}
      <div>
        <Link href="/" className="text-xl font-bold">
          Ovie<span className="text-brand">.</span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 text-lg">
        <Link href="#projects" onClick={closeMenu} className="hover:text-brand">
          Projects
        </Link>
        <Link href="#about" onClick={closeMenu} className="hover:text-brand">
          About
        </Link>
        <Link
          href="#experience"
          onClick={closeMenu}
          className="hover:text-brand"
        >
          Experience
        </Link>
        <Link href="#contact" onClick={closeMenu} className="hover:text-brand">
          Contact
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden z-20 cursor-pointer" onClick={toggleMenu}>
        {menuOpen ? <X size={30} /> : <Menu size={30} />}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col items-center justify-center gap-10 absolute top-0 left-0 w-full h-screen bg-black text-white text-2xl">
          <Link
            href="#projects"
            onClick={closeMenu}
            className="hover:text-brand"
          >
            Projects
          </Link>
          <Link href="#about" onClick={closeMenu} className="hover:text-brand">
            About
          </Link>
          <Link
            href="#experience"
            onClick={closeMenu}
            className="hover:text-brand"
          >
            Experience
          </Link>
          <Link
            href="#contact"
            onClick={closeMenu}
            className="hover:text-brand"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}

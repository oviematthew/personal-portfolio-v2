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
      className={`sticky top-0 z-50 flex justify-between lg:justify-around items-center px-5 py-10 transition-all duration-300 ${
        isScrolled
          ? "bg-background/70 backdrop-blur-md shadow-md"
          : "bg-background"
      }`}
    >
      {/* Logo */}
      <div>
        <Link href="/" className="text-xl font-semibold font-text">
          ovie<span className="text-brand">.</span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 text-lg italic">
        <Link href="/" className="hover:text-brand">
          home
        </Link>
        <Link href="/#about" className="hover:text-brand">
          about
        </Link>
        <Link href="/#projects" className="hover:text-brand">
          projects
        </Link>
        <Link href="/blog" className="hover:text-brand">
          blog
        </Link>
        <Link href="/#contact" className="hover:text-brand">
          contact
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden z-20 cursor-pointer" onClick={toggleMenu}>
        {menuOpen ? <X size={30} /> : <Menu size={30} />}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col items-center justify-center gap-10 absolute top-0 left-0 w-full h-screen bg-black text-white text-2xl">
          <Link href="/" onClick={closeMenu} className="hover:text-brand">
            home
          </Link>
          <Link href="/#about" onClick={closeMenu} className="hover:text-brand">
            about
          </Link>
          <Link
            href="/#projects"
            onClick={closeMenu}
            className="hover:text-brand"
          >
            projects
          </Link>
          <Link href="/blog" onClick={closeMenu} className="hover:text-brand">
            blog
          </Link>
          <Link
            href="/#contact"
            onClick={closeMenu}
            className="hover:text-brand"
          >
            contact
          </Link>
        </div>
      )}
    </nav>
  );
}

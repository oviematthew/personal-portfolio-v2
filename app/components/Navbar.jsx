"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    z;
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="mt-5 flex justify-around items-center px-5 relative">
        <div className="left-nav">
          <Link href="/" className="text-xl font-bold">
            Ovie{" "}
            <span className="text-hover:text-brand font-bold text-xl">.</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-lg">
          <Link href="#projects" className="hover:text-brand transition">
            Projects
          </Link>
          <Link href="#about" className="hover:text-brand transition">
            About
          </Link>
          <Link href="#experience" className="hover:text-brand transition">
            Experience
          </Link>
          <Link href="#contact" className="hover:text-brand transition">
            Contact
          </Link>
          <Link href="#contact" className="hover:text-brand transition">
            Contact
          </Link>
          <Link href="#contact" className="hover:text-brand transition"></Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden z-20" onClick={toggleMenu}>
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } flex-col items-center justify-center gap-10 absolute top-0 left-0 w-full h-screen bg-black text-white text-2xl`}
        >
          <Link
            href="#projects"
            onClick={closeMenu}
            className="hover:text-[#F15A24] transition"
          >
            Projects
          </Link>
          <Link
            href="#about"
            onClick={closeMenu}
            className="hover:text-[#F15A24] transition"
          >
            About
          </Link>
          <Link
            href="#experience"
            onClick={closeMenu}
            className="hover:text-[#F15A24] transition"
          >
            Experience
          </Link>
          <Link
            href="#contact"
            onClick={closeMenu}
            className="hover:text-[#F15A24] transition"
          >
            Contact
          </Link>
        </div>
      </nav>
    </>
  );
}

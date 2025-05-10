"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-[8rem] font-bold tracking-tight leading-none text-brand"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-gray-300 mb-6 text-center max-w-md"
      >
        You wandered into unknown territory. This page doesn’t exist.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link
          href="/"
          className="px-5 py-2 border border-[#F15A24] rounded-full text-sm hover:bg-brand hover:text-white hover:scale-95 transition"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

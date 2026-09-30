"use client";

import { useSearchParams, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import StatusPage from "../components/StatusPage";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const fullName = searchParams.get("fullName");

  if (!fullName) {
    redirect("/");
  }

  // First name only, capitalized
  const firstName = fullName.trim().split(" ")[0];
  const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return (
    <StatusPage
      variant="success"
      title={
        <>
          Thanks, {formattedName}
          <span className="text-brand">.</span>
        </>
      }
      actions={
        <>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-cta px-7 text-[15px] font-medium text-white transition hover:bg-brand active:scale-[0.98]"
          >
            Back home
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/blog"
            className="inline-flex h-12 items-center rounded-full border border-white/15 px-7 text-[15px] text-white transition hover:border-white/40 active:scale-[0.98]"
          >
            Read my writing
          </Link>
        </>
      }
    >
      Your message is in. I read everything and will get back to you as soon as I can.
    </StatusPage>
  );
}

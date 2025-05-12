"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import Link from "next/link";

export default function SuccessContent() {
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const fullName = searchParams.get("fullName");

  if (!fullName) {
    redirect("/");
  }

  // Simulated loading delay (500ms)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="lg:h-screen w-full flex justify-center items-center px-4 mt-5">
      <div className="text-center flex flex-col items-center w-[90%] xl:w-1/2">
        {loading ? (
          <div className="space-y-4 animate-pulse mt-10 w-[90%]">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-10" />
          </div>
        ) : (
          <h1 className="text-2xl flex gap-2 items-center md:text-3xl font-cormorant text-pretty mb-10">
            Your Message Has Been Sent! <MailCheck />
          </h1>
        )}

        {/* Text Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse mt-10 w-[90%]">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/4 mx-auto" />
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto" />
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto" />
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto" />
          </div>
        ) : (
          <>
            <p className="text-lg font-montserrat text-pretty">
              Thank you for reaching out to me,{" "}
              <span className="text-black dark:text-white font-montserrat text-xl  font-bold">
                {fullName}
              </span>
              {"!"}
            </p>
            <p className="mt-5 text-sm lg:text-lg font-montserrat">
              If you do not receive a response within 48 hours, please check
              your spam folder. In some cases, my reply has ended up there.
            </p>

            <div className="mt-8">
              <Link href="/">
                <button className="cursor-pointer inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic">
                  Go Home
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

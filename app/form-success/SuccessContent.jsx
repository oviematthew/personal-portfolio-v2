"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function SuccessContent() {
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const fullName = searchParams.get("fullName");

  if (!fullName) {
    redirect("/");
  }

  // Capitalize first letter of fullName and join
  const formattedName = fullName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full flex justify-center items-center px-4 mt-5">
      <div className="text-center flex flex-col items-center w-[90%] xl:w-1/2">
        {loading ? (
          <div className="space-y-4 animate-pulse mt-10 w-[90%]">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          </div>
        ) : (
          <h1 className="text-lg flex gap-2 items-center md:text-2xl font-cormorant text-pretty mb-5">
            Your Message Has Been Sent{" "}
            <span className="text-brand font-bold">{formattedName}</span>!
          </h1>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse mt-10 w-[90%]">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/4 mx-auto" />
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto" />
          </div>
        ) : (
          <>
            <p className="text-sm lg:text-lg font-montserrat">
              Thank you for reaching out, I appreciate your message and will get
              back to you as soon as possible.
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

import React from "react";
import Link from "next/link";
export const metadata = {
  title: "Form Submission Failed",
  description: "Message failed to send.",
  robots: "noindex, nofollow",
};

export default function FormFailed() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-2xl lg:text-4xl font-cormorant text-red-600 font-semibold">
        Oops! Something went wrong!
      </h1>
      <p className="mt-4 text-md font-montserrat max-w-xl text-white">
        I'm sorry, but your message could not be sent. Please try again in a few
        minutes or contact me directly via{" "}
        <a
          href="mailto:info@oviematthew.com"
          className="underline text-brand hover:underline transition"
        >
          email
        </a>
        .
      </p>

      <div className="mt-8 flex gap-4">
        <Link href="/#contact">
          <button className="cursor-pointer inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic">
            Try Again
          </button>
        </Link>

        <Link href="/">
          <button className="cursor-pointer inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-brands bg-white hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export const metadata = {
  title: "Form Submission Success",
  description: "Message sent successfully.",
  robots: "noindex, nofollow",
};

export default function FormSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

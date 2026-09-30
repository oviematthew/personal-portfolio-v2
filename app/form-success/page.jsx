import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export const metadata = {
  title: "Message sent | Matthew Ovie Enamuotor",
  description: "Message sent successfully.",
  robots: "noindex, nofollow",
};

export default function FormSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100dvh-4rem)]" />}>
      <SuccessContent />
    </Suspense>
  );
}

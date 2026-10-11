import Link from "next/link";
import StatusPage from "../components/StatusPage";

export const metadata = {
  title: "Message failed | Matthew Ovie Enamuotor",
  description: "Message failed to send.",
  robots: "noindex, nofollow",
};

export default function FormFailed() {
  return (
    <StatusPage
      variant="error"
      title={
        <>
          That didn&apos;t send
          <span className="text-brand">.</span>
        </>
      }
      actions={
        <>
          <Link
            href="/#contact"
            className="inline-flex h-12 items-center rounded-full bg-brand-cta px-7 text-[15px] font-medium text-white transition hover:bg-brand active:scale-[0.98]"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full border border-white/15 px-7 text-[15px] text-white transition hover:border-white/40 active:scale-[0.98]"
          >
            Back home
          </Link>
        </>
      }
    >
      Something went wrong on my end. Please try again in a few minutes, or email me directly at{" "}
      <a
        href="mailto:hello@oviematthew.com"
        className="link-brand"
      >
        hello@oviematthew.com
      </a>
      .
    </StatusPage>
  );
}

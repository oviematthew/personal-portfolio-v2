import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Cookie Policy | Matthew Ovie Enamuotor",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="September 29, 2026"
      intro="Cookies are small files stored in your browser. This site uses them only for analytics."
      sections={[
        {
          heading: "What is used",
          body: [],
          list: [
            "Google Analytics and Google Tag Manager cookies, which measure traffic and how pages are used.",
            "Vercel Analytics, which counts page views without using personal identifiers.",
            "A small flag in your browser's local storage that remembers you dismissed the cookie notice.",
          ],
        },
        {
          heading: "Third-party cookies",
          body: [
            "The contact form loads Google reCAPTCHA, which may set its own cookies to tell humans from bots.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can block or delete cookies in your browser settings. The site works without them. You can also opt out of Google Analytics with Google's browser add-on.",
          ],
        },
      ]}
    />
  );
}

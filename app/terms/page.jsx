import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Terms of Use | Matthew Ovie Enamuotor",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="September 29, 2026"
      intro="By using this website you agree to these terms. If you do not agree, please do not use the site."
      sections={[
        {
          heading: "Content and ownership",
          body: [
            "The design, writing, code samples and images on this site belong to Matthew Ovie Enamuotor unless stated otherwise. Screenshots of client and third-party projects belong to their respective owners and are shown for portfolio purposes.",
            "You may share links to the site and quote short excerpts with credit. Please ask before reproducing anything in full.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [
            "Do not misuse the site: no attempts to disrupt it, gain unauthorized access, or send spam or abusive content through the contact form.",
          ],
        },
        {
          heading: "No warranty",
          body: [
            "The site and its articles are provided as is, for general information. I try to keep things accurate but make no guarantees, and I am not liable for losses that result from relying on them.",
          ],
        },
        {
          heading: "External links",
          body: [
            "The site links to third-party websites, including client projects and social profiles. I do not control them and am not responsible for their content or privacy practices.",
          ],
        },
        {
          heading: "Changes and governing law",
          body: [
            "I may update these terms from time to time. The date above shows the latest version. These terms are governed by the laws of Ontario, Canada.",
          ],
        },
      ]}
    />
  );
}

import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Privacy Policy | Matthew Ovie Enamuotor",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 29, 2026"
      intro="This is the personal portfolio site of Matthew Ovie Enamuotor. I respect your privacy and collect only what I need to run the site. This policy explains what that is."
      sections={[
        {
          heading: "Analytics",
          body: ["I use these tools to understand how visitors use the site:"],
          list: [
            "Google Analytics and Google Tag Manager: traffic and usage statistics. These may set cookies and collect anonymized IP addresses and usage behavior.",
            "Vercel Analytics: page views and visitor counts. The data is aggregated and not personally identifiable.",
          ],
        },
        {
          heading: "Contact form",
          body: [
            "If you use the contact form, I receive the name, email address and message you submit. I use them only to reply to you. The form is protected by Google reCAPTCHA, which is subject to Google's own privacy policy.",
          ],
        },
        {
          heading: "Referral links",
          body: [
            "Some links to this site include a short source tag (for example, from a resume or profile). When you arrive through one, I may log the source, the approximate city and country of your visit, and the time. I do not store your IP address or identify you personally.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Cookies are used only to support the analytics tools above. See the Cookie Policy for details and how to turn them off.",
          ],
        },
        {
          heading: "Data sharing",
          body: [
            "I do not sell your personal information. I share data only with the service providers needed to run the site, such as analytics and hosting, or when required by law.",
          ],
        },
      ]}
    />
  );
}

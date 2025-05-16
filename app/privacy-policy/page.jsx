export const metadata = {
  title: "Privacy Policy - Matthew Ovie Enamuotor",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="h-screen mx-auto max-w-3xl px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="italic mb-5 text-gray-400">Updated: May 1 2025</p>

      <p className="mb-4">
        On my portfolio website, I respect your privacy and are committed to
        protecting your personal data. This policy outlines how I handle your
        information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Analytics</h2>
      <p className="mb-4">
        I use the following tools to understand how visitors use our site:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>
          <strong>Google Analytics</strong>: Helps me analyze Ibsite traffic and
          usage. This tool may use cookies and collect anonymized IP addresses
          and usage behavior.
        </li>
        <li>
          <strong>Vercel Analytics</strong>: Provides real-time metrics such as
          page views and visitor counts. This data is aggregated and not
          personally identifiable.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Cookies</h2>
      <p className="mb-4">
        Cookies are used only to support the analytics tools mentioned above.
        You can disable cookies through your browser settings if you prefer not
        to be tracked.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Data Sharing</h2>
      <p className="mb-4">
        I do not sell or share your personal information with third parties,
        except as required by law or for the operation of analytics tools.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Contact</h2>
      <p>
        If you have questions about this privacy policy, please email me at{" "}
        <a href="mailto:info@oviematthew.com" className="underline text-brand">
          info@oviematthew.com
        </a>
        .
      </p>
    </main>
  );
}

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import CookiePolicy from "./components/CookiePolicy";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Matthew Ovie Enamuotor - Frontend Web and Mobile App Developer",
  description:
    "Matthew Ovie Enamuotor is a Frontend Web and Mobile App Developer, pursuing his passion in software engineering. Check out his portfolio to see his work and projects.",
  keywords:
    "Matthew Ovie Enamuotor, Frontend Web Developer, Mobile App Developer, Software Engineer, Portfolio, Web and Mobile Developer In Canada, Next.Js Developer, React Developer, React Native Developer, JavaScript Developer, TypeScript Developer, UI/UX Developer, Matthew Ovie Enamuotor's Portfolio, Ovie Enamuotor, Ovie Enamuotor Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="96705xhckmNKyzoCMWmXJzku5MR3tOZpiq7rthh22QI"
        />
      </head>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER} />
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Analytics />
        <CookiePolicy />
        <Footer />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
    </html>
  );
}

import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTopBtn from "./components/ScrollToTopBtn";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata = {
  title: "Matthew Ovie Enamuotor",
  description:
    "Matthew Ovie Enamuotor is a Frontend and Mobile App Developer, pursuing his passion in software engineering. Check out his portfolio to see his work and projects.",
  keywords:
    "Matthew Ovie Enamuotor, Frontend Developer, Mobile App Developer, Software Engineer, Portfolio, Web and Mobile Developer In Canada",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER} />
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <Navbar />
        {children}
        <Analytics />
        <ScrollToTopBtn />
        <Footer />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
    </html>
  );
}

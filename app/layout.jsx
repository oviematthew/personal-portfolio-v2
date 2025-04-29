import "./globals.css";
import { Lato, Quicksand, Montserrat } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTopBtn from "./components/ScrollToTopBtn";

const quickSand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "700", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
      <body
        className={`${quickSand.variable} ${lato.variable} ${montserrat.variable} antialiased`}
      >
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

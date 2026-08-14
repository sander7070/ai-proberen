import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import SatoshiFont from "@/components/SatoshiFont";
import { publicConfig } from "@/lib/config";
import { PAPER_HEX } from "@/lib/tokens";
import "./globals.css";

/**
 * Satoshi is het merklettertype en wordt van Fontshare geladen. Deze
 * zelfgehoste snit staat eronder in de stack: die rendert meteen, zodat er
 * geen onzichtbare tekst of layoutsprong is als Fontshare traag of
 * onbereikbaar is.
 */
const fallback = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fallback",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicConfig.siteUrl),
  title: {
    default: "upgrAIde — minder manueel werk, meer capaciteit",
    template: "%s — upgrAIde",
  },
  description:
    "upgrAIde verbindt uw systemen en neemt terugkerend werk over. Van één taak tot een volledige organisatie.",
  applicationName: "upgrAIde",
  authors: [{ name: "upgrAIde" }],
  robots: { index: true, follow: true },
  icons: { icon: "/merk/monogram.webp", apple: "/merk/monogram.webp" },
};

export const viewport: Viewport = {
  themeColor: PAPER_HEX,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl-BE" className={fallback.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <SatoshiFont />
        {/* Zonder JavaScript komen de onthulanimaties nooit op gang. Dan moet
            de inhoud gewoon staan waar ze staat. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <MotionProvider>
          <a className="skiplink glass-strong rounded-pill px-4 py-2 text-sm font-medium" href="#hoofd">
            Naar de inhoud
          </a>
          <Header />
          <main id="hoofd">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Quicksand, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Tennis Club Halluin (TCH) — Réservez vos terrains en ligne · Depuis 1927",
  description:
    "Club de tennis à Halluin depuis 1927. Réservez vos terrains en ligne, rejoignez notre communauté de 300+ membres.",
  openGraph: {
    images: ["/assets/logos/logo-blanc-complet.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: "Tennis Club Halluin",
  url: "https://tch-halluin.fr",
  address: {
    streetAddress: "341 rue de la Lys",
    addressLocality: "Halluin",
    postalCode: "59250",
    addressCountry: "FR",
  },
  email: "contact@tch.fr",
  openingHours: ["Mo-Fr 08:00-22:00", "Sa-Su 09:00-20:00"],
  sport: "Tennis",
  foundingDate: "1927",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${quicksand.variable} ${dmSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col pt-16">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}

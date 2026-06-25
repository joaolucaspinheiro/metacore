import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Header } from "@/components/layout/Header";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const SITE_URL = "https://metacore-lovat.vercel.app";
const TITLE = "MetaCore — Team Builder e Meta de Pokémon Champions VGC";
const DESCRIPTION =
  "Monte times de Pokémon Champions VGC com sugestões baseadas no meta real, busque times de torneios reais e exporte pro Pokepaste.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · MetaCore",
  },
  description: DESCRIPTION,
  keywords: [
    "Pokemon Champions",
    "VGC",
    "team builder",
    "pokepaste",
    "competitive pokemon",
    "meta",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "MetaCore",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950">
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

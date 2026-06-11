import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import AmbientBackground from "@/components/background/AmbientBackground";
import "./globals.css";

const display = Anton({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s · Wave Particle",
  },
  description: SITE_TAGLINE,
  openGraph: {
    title: SITE_NAME,
    description: SITE_TAGLINE,
    siteName: "Wave Particle Quiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning>
        <AmbientBackground />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Babson Generator Build-a-thon 2026",
  description:
    "AI x Body & Mind — A 12-hour hackathon at Babson College on April 11, 2026",
  openGraph: {
    title: "Babson Generator Build-a-thon 2026",
    description: "AI x Body & Mind — April 11, 2026 at Babson College",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "Babson College",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Babson Generator Build-a-thon 2026",
    description: "AI x Body & Mind — April 11, 2026 at Babson College",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

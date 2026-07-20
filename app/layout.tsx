import type { Metadata } from "next";
import { Bebas_Neue, Outfit, Space_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-outfit",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

const ogImageUrl = new URL("/img/og-image.jpg", SITE_URL).toString();

export const metadata: Metadata = {
  title: {
    default: "Omar Khalil — Multimedia Designer",
    template: "%s — Omar Khalil",
  },
  description:
    "Creative Multi Media Designer focused on graphic design, video editing, multimedia production, AI visuals, and 3D workflows.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Omar Khalil",
    url: SITE_URL,
    title: "Omar Khalil — Multimedia Designer",
    description:
      "Creative Multi Media Designer focused on graphic design, video editing, multimedia production, AI visuals, and 3D workflows.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Omar Khalil Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar Khalil — Multimedia Designer",
    description:
      "Creative Multi Media Designer focused on graphic design, video editing, multimedia production, AI visuals, and 3D workflows.",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Omar Khalil",
  jobTitle: "Multimedia Designer",
  description:
    "Creative Multi Media Designer focused on graphic design, video editing, multimedia production, AI visuals, and 3D workflows.",
  url: SITE_URL,
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${outfit.variable} ${spaceMono.variable}`}>
      <head>
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/font/bootstrap-icons.css" rel="stylesheet" />
        <link href="/css/all.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

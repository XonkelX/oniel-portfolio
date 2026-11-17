import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/content/site";
import "../globals.css";

// Body and mono fonts keep the existing CSS variable names so every page picks them up.
const bodyFont = Inter_Tight({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Oniel Alejo Feliz — Ingeniero de Software",
    template: "%s — Oniel Alejo Feliz",
  },
  description:
    "Ingeniero de software especializado en TypeScript, Node.js, React, Next.js y PostgreSQL, con trabajo revisado en bases de código existentes.",
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/es",
    languages: { en: "/", es: "/es" },
  },
  openGraph: {
    type: "website",
    locale: "es_US",
    alternateLocale: ["en_US"],
    url: "/es",
    siteName: siteConfig.name,
    title: "Oniel Alejo Feliz — Ingeniero de Software",
    description:
      "TypeScript, Node.js, React, Next.js y PostgreSQL. Código existente, confiabilidad, pruebas y correcciones enfocadas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oniel Alejo Feliz — Ingeniero de Software",
    description:
      "TypeScript, Node.js, React, Next.js y PostgreSQL. Código existente, confiabilidad, pruebas y correcciones enfocadas.",
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6b1424" },
    { media: "(prefers-color-scheme: dark)", color: "#6b1424" },
  ],
};

const themeScript = `
  try {
    const stored = localStorage.getItem('theme');
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  jobTitle: "Ingeniero de Software",
  email: `mailto:${siteConfig.email}`,
  sameAs: [siteConfig.githubUrl, siteConfig.linkedinUrl],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tampa",
    addressRegion: "FL",
    addressCountry: "US",
  },
  knowsLanguage: ["English", "Spanish"],
};

export default function SpanishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bodyFont.variable} ${monoFont.variable} ${displayFont.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a className="skip-link" href="#main-content">
          Saltar al contenido principal
        </a>
        <SiteHeader locale="es" />
        {children}
        <SiteFooter locale="es" />
      </body>
    </html>
  );
}

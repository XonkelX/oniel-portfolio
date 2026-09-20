import type { Metadata } from "next";
import { ShopifyEvidencePage } from "@/components/shopify-evidence-page";

export const metadata: Metadata = {
  title: "Shopify Engineering — Storefronts and Integrations",
  description:
    "Independent Shopify engineering evidence: custom Liquid sections, advanced product pages, personalization, cart logic, debugging, QA, Admin GraphQL, and webhooks.",
  alternates: {
    canonical: "/shopify",
    languages: { en: "/shopify", es: "/es/shopify" },
  },
  openGraph: {
    title: "Shopify Engineering — Oniel Alejo Feliz",
    description:
      "Real Shopify development-store behavior, direct source code, and test evidence for storefront and integration work.",
    url: "/shopify",
  },
};

export default function ShopifyPage() {
  return <ShopifyEvidencePage locale="en" />;
}

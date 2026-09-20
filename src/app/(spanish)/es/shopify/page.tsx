import type { Metadata } from "next";
import { ShopifyEvidencePage } from "@/components/shopify-evidence-page";

export const metadata: Metadata = {
  title: "Ingeniería Shopify — Tiendas e integraciones",
  description:
    "Evidencia técnica Shopify independiente: secciones Liquid, productos avanzados, personalización, carrito, depuración, QA, Admin GraphQL y webhooks.",
  alternates: {
    canonical: "/es/shopify",
    languages: { en: "/shopify", es: "/es/shopify" },
  },
  openGraph: {
    title: "Ingeniería Shopify — Oniel Alejo Feliz",
    description:
      "Comportamiento real en Shopify, código fuente directo y pruebas de tiendas e integraciones.",
    url: "/es/shopify",
  },
};

export default function ShopifySpanishPage() {
  return <ShopifyEvidencePage locale="es" />;
}

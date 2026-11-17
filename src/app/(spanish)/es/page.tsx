import type { Metadata } from "next";
import { VinoHome } from "@/components/vino-home";

export const metadata: Metadata = {
  title: { absolute: "Oniel Alejo Feliz — Ingeniero de Software" },
  description:
    "Desarrollador full-stack en Tampa: productos web con TypeScript, React, Next.js y PostgreSQL, y anuncios con IA para negocios.",
  alternates: {
    canonical: "/es",
    languages: { en: "/", es: "/es" },
  },
};

export default function SpanishHome() {
  return <VinoHome locale="es" />;
}

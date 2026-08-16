import { projects } from "@/content/projects";
import type { Project } from "@/types/project";

const translations: Record<
  Project["slug"],
  Pick<
    Project,
    "category" | "summary" | "status" | "role" | "evidence" | "highlights"
  >
> = {
  sinmanos: {
    category: "Producto full-stack · Analítica de League of Legends",
    summary:
      "Una plataforma enfocada en LAN para consultar perfiles, historial de partidas, tier lists, builds, runas, counters y orden de habilidades.",
    status: "Beta pública",
    role: "Diseño de producto, frontend, integración con Riot API y despliegue",
    evidence: [
      { label: "Versión", value: "Beta pública" },
      { label: "Datos", value: "Riot API + Data Dragon" },
      { label: "Enfoque", value: "Jugadores LAN + analítica de campeones" },
    ],
    highlights: [
      "Búsqueda por Riot ID en LAN e historial detallado de partidas",
      "Tier lists, builds, runas, counters y progresión de habilidades",
      "Sistema visual original desplegado en Cloudflare",
    ],
  },
  relay: {
    category: "Sistemas distribuidos · Entrega de webhooks",
    summary:
      "Un sistema desplegado de entrega de webhooks con programación durable, firmas, reintentos deterministas, evidencia operativa y un laboratorio público de fallos.",
    status: "Versión de portafolio v1.0",
    role: "Diseño de sistemas, diseño de producto e ingeniería full-stack",
    evidence: [
      { label: "Versión", value: "Portafolio v1.0" },
      { label: "Calidad", value: "304 verificaciones de entrega" },
      { label: "Enfoque", value: "Confiabilidad + evidencia" },
    ],
    highlights: [
      "Outbox transaccional, reintentos durables, recuperación de leases y entrega al menos una vez",
      "Firmas compatibles con Standard Webhooks y secretos cifrados",
      "Evidencia por intento, linaje de replay y siete escenarios de fallo controlados",
    ],
  },
  next: {
    category: "Producto en tiempo real · Gestión de turnos",
    summary:
      "Un sistema sincronizado de turnos para clientes, personal y pantallas públicas, con autorización y transiciones de estado aplicadas en PostgreSQL.",
    status: "Versión de portafolio v1.0",
    role: "Diseño de producto e ingeniería full-stack",
    evidence: [
      { label: "Versión", value: "Portafolio v1.0" },
      { label: "Calidad", value: "131 verificaciones de entrega" },
      { label: "Enfoque", value: "Tiempo real + autorización" },
    ],
    highlights: [
      "Vistas de cliente, personal y pantalla pública que convergen sin recargar",
      "RLS en la base de datos, comandos idempotentes y cambios transaccionales",
      "131 verificaciones entre aplicación, base de datos, navegador y producción",
    ],
  },
  careerflow: {
    category: "Producto full-stack · Gestión profesional",
    summary:
      "Una plataforma desplegada para organizar solicitudes de empleo, fechas límite, progreso y versiones del currículum.",
    status: "Versión de portafolio v1.0",
    role: "Diseño de producto e ingeniería full-stack",
    evidence: [
      { label: "Versión", value: "Portafolio v1.0" },
      { label: "Calidad", value: "179 pruebas aprobadas" },
      { label: "Enfoque", value: "Flujos conscientes de la privacidad" },
    ],
    highlights: [
      "Propiedad de datos aplicada en el servidor para cada operación",
      "Búsqueda, filtros, fechas, métricas y versiones del currículum",
      "Flujos responsivos y accesibles con QA de entrega documentado",
    ],
  },
};

export const spanishProjects: readonly Project[] = projects.map((project) => ({
  ...project,
  ...translations[project.slug],
}));

export function getSpanishProject(slug: string) {
  return spanishProjects.find((project) => project.slug === slug);
}

import { openSourceContributions } from "@/content/contributions";

const translations: Record<string, { title: string; proof: string }> = {
  "Apache Fineract": {
    title: "Títulos para las rutas de Contabilidad",
    proof:
      "Integrado tras aprobación del mantenedor y la suite completa de CI de Apache",
  },
  Clarvia: {
    title: "Accesibilidad con teclado y lector de pantalla",
    proof:
      "Integrado tras pruebas con teclado, axe, NVDA, build y revisión del mantenedor",
  },
  Agenta: {
    title: "Validación estricta del encabezado de sesión",
    proof:
      "477 pruebas unitarias aprobadas; CLA y revisiones automatizadas completas",
  },
  "FinVerify / Finverify": {
    title: "Puntajes de confianza accesibles por teclado",
    proof: "0 violaciones críticas de axe en las vistas auditadas",
  },
  "Code.Sydney / BlueHex": {
    title: "Cobertura de navegador sobre el build de producción",
    proof:
      "18 verificaciones de navegador y un workflow dedicado de GitHub Actions",
  },
  "Apache Maka": {
    title: "Redescubrimiento limitado de herramientas MCP",
    proof:
      "Integrado después de revisión adversarial, pruebas de regresión y CI upstream",
  },
  Reticle: {
    title: "Persistencia de rutas aprendidas",
    proof:
      "Suite completa de CI, E2E multiplataforma y revisión del mantenedor",
  },
};

export const spanishContributions = openSourceContributions.map(
  (contribution) => ({
    ...contribution,
    ...translations[contribution.repository],
    status: contribution.status === "Merged" ? "Integrado" : "En revisión",
  }),
);

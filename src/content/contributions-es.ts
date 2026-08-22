import { openSourceContributions } from "@/content/contributions";

const translations: Record<string, { title: string; proof: string }> = {
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

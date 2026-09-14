import { openSourceContributions } from "@/content/contributions";

const translations: Record<string, { title: string; proof: string }> = {
  "https://github.com/reticlehq/reticle/pull/278": {
    title: "Persistencia de rutas aprendidas",
    proof:
      "Integrado tras revisión sustantiva del mantenedor y validación upstream",
  },
  "https://github.com/apache/maka/pull/2989": {
    title: "Redescubrimiento limitado de herramientas MCP",
    proof:
      "Integrado tras revisión sustantiva del mantenedor y cobertura de regresión",
  },
  "https://github.com/apache/fineract-backoffice-ui/pull/475": {
    title: "Pruebas de clientes migradas a Vitest",
    proof: "Integrado tras aprobación del mantenedor y CI upstream exitoso",
  },
  "https://github.com/codesydney/bluehex/pull/29": {
    title: "Cobertura de navegador sobre el build de producción",
    proof: "Integrado tras correcciones solicitadas y CI de navegador en verde",
  },
  "https://github.com/clarvia-org/clarvia-graph/pull/269": {
    title: "Accesibilidad con teclado y lector de pantalla",
    proof:
      "Integrado tras revisión del mantenedor y validación del repositorio",
  },
  "https://github.com/apache/fineract-backoffice-ui/pull/431": {
    title: "Títulos para las rutas de Contabilidad",
    proof: "Integrado tras CI upstream exitoso",
  },
  "https://github.com/Agenta-AI/agenta/pull/6224": {
    title: "Validación estricta del encabezado de sesión",
    proof: "Abierto; requisitos de contribución y CLA completos",
  },
  "https://github.com/FinVerify/Finverify/pull/70": {
    title: "Puntajes de confianza accesibles por teclado",
    proof: "Abierto; implementación de accesibilidad en revisión",
  },
};

export const spanishContributions = openSourceContributions.map(
  (contribution) => ({
    ...contribution,
    ...translations[contribution.href],
    status: contribution.status === "Merged" ? "Integrado" : "En revisión",
  }),
);

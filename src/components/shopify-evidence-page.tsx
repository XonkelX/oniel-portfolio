import Image from "next/image";
import { ExternalLink } from "@/components/external-link";
import { siteConfig, type Locale } from "@/content/site";
import { shopifyEvidence, shopifyRepository } from "@/content/shopify";
import "@/app/shopify.css";

const spanishCards = [
  {
    title: "Página de producto avanzada",
    problem:
      "Un cambio de variante puede desincronizar precio, imagen, disponibilidad y carrito.",
    proof:
      "Un producto real de seis variantes mantiene esos estados alineados y muestra contenido de metafields y metaobjects.",
  },
  {
    title: "Sección Shopify configurable",
    problem:
      "El comerciante necesita actualizar comparaciones sin editar Liquid.",
    proof:
      "Una sección reutilizable permite configurar contenido, bloques y diseño en el editor de temas.",
  },
  {
    title: "Configurador de producto",
    problem:
      "La personalización necesita validación y debe conservarse en el carrito.",
    proof:
      "Grabado, estilo, nota y envoltura viajan con una variante real como propiedades visibles del artículo.",
  },
  {
    title: "Carrito y lógica de compra",
    problem:
      "La compra por cajas exige redondeo predecible y cantidades correctas.",
    proof:
      "Una calculadora convierte la demanda en cajas completas; el carrito AJAX se actualiza con datos de Shopify.",
  },
  {
    title: "Depuración de temas",
    problem:
      "Los errores heredados pueden mostrar un carrito confuso o inutilizable.",
    proof:
      "Tres correcciones respaldadas por código cubren contador desactualizado, variante omitida y carrito vacío inválido.",
  },
  {
    title: "Rendimiento y QA",
    problem:
      "Un tema funcional necesita controles de calidad repetibles y límites documentados.",
    proof:
      "Se registraron Theme Check, nueve auditorías Lighthouse, pruebas de teclado y móvil, y controles de CI.",
  },
  {
    title: "Integración de inventario",
    problem:
      "Las diferencias de inventario y fallas de sincronización requieren recuperación visible.",
    proof:
      "Una app integrada usa GraphQL y webhooks reales con reintentos, idempotencia y registros en PostgreSQL.",
  },
] as const;

const copy = {
  en: {
    eyebrow: "Independent Shopify engineering",
    title: "Storefronts and integrations you can inspect.",
    intro:
      "Real development-store behavior, direct source links, and test evidence for scoped Shopify work. No commissioned client results or conversion claims.",
    evidence: "Explore the work",
    repository: "Inspect repository",
    sectionEyebrow: "Seven focused proofs",
    sectionTitle: "The problem, the implementation, the verification.",
    sectionIntro:
      "Each example links to a concise case study and the code behind it. Store previews require development-store access; screenshots and source remain public.",
    problem: "Problem",
    verified: "Verified behavior",
    caseStudy: "Case study",
    source: "Source",
    preview: "Store preview · access required",
    architectureEyebrow: "Backend proof",
    architectureTitle:
      "Inventory synchronization with visible failure handling.",
    architectureText:
      "The embedded app reads Shopify inventory through Admin GraphQL, receives inventory and product webhooks, consults an authenticated mock warehouse, and persists claims, retries, and outcomes in PostgreSQL. The current app uses a local development tunnel; it is not presented as a production-hosted service.",
    noteTitle: "Evidence boundaries",
    noteText:
      "This is independent technical work in a password-protected Shopify development store. Before states in the debugging examples are labeled reconstructions. Captured-state clips are not described as live recordings. App behavior was verified in the development store, not under a production SLA.",
    ctaEyebrow: "Scoped Shopify work",
    ctaTitle: "Have a specific theme or integration problem?",
    ctaText:
      "Send the store context, current behavior, and desired result. I can scope one safe change and show how it will be verified.",
    contact: "Discuss a project",
  },
  es: {
    eyebrow: "Ingeniería Shopify independiente",
    title: "Tiendas e integraciones que puedes inspeccionar.",
    intro:
      "Comportamiento real en una tienda de desarrollo, enlaces directos al código y pruebas para trabajos Shopify definidos. Sin resultados de clientes ni métricas inventadas.",
    evidence: "Explorar los proyectos",
    repository: "Inspeccionar repositorio",
    sectionEyebrow: "Siete pruebas concretas",
    sectionTitle: "El problema, la implementación y la verificación.",
    sectionIntro:
      "Cada ejemplo enlaza un caso breve y su código. Las vistas de Shopify requieren acceso a la tienda de desarrollo; las capturas y el código son públicos.",
    problem: "Problema",
    verified: "Comportamiento verificado",
    caseStudy: "Caso técnico",
    source: "Código",
    preview: "Vista Shopify · requiere acceso",
    architectureEyebrow: "Prueba backend",
    architectureTitle: "Inventario sincronizado con fallas visibles.",
    architectureText:
      "La app integrada lee inventario con Admin GraphQL, recibe webhooks, consulta un almacén simulado autenticado y guarda eventos, reintentos y resultados en PostgreSQL. Actualmente usa un túnel de desarrollo local; no se presenta como servicio en producción.",
    noteTitle: "Límites de la evidencia",
    noteText:
      "Es trabajo técnico independiente en una tienda de desarrollo protegida. Los estados previos de los bugs están identificados como reconstrucciones. Los clips de capturas no se describen como grabaciones en vivo. La app se verificó en desarrollo, sin promesa de operación en producción.",
    ctaEyebrow: "Trabajo Shopify definido",
    ctaTitle: "¿Tienes un problema concreto de tema o integración?",
    ctaText:
      "Envíame el contexto de la tienda, el comportamiento actual y el resultado esperado. Podemos definir un cambio seguro y cómo verificarlo.",
    contact: "Hablemos del proyecto",
  },
} as const;

export function ShopifyEvidencePage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const contactHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Scoped Shopify project")}`;

  return (
    <main id="main-content" className="shopify-page">
      <section className="shopify-hero container">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="shopify-hero__intro">{t.intro}</p>
        <div className="actions">
          <a className="button button--primary" href="#shopify-work">
            {t.evidence} <span aria-hidden="true">↓</span>
          </a>
          <ExternalLink
            className="button button--secondary"
            href={shopifyRepository}
            locale={locale}
          >
            {t.repository}
          </ExternalLink>
        </div>
      </section>

      <section
        id="shopify-work"
        className="shopify-work section container"
        aria-labelledby="shopify-work-title"
      >
        <div className="shopify-work__intro">
          <p className="eyebrow">{t.sectionEyebrow}</p>
          <h2 id="shopify-work-title">{t.sectionTitle}</h2>
          <p>{t.sectionIntro}</p>
        </div>
        <div className="shopify-grid">
          {shopifyEvidence.map((item, index) => {
            const localized = locale === "es" ? spanishCards[index] : item;
            return (
              <article className="shopify-card" key={item.title}>
                <div className="shopify-card__image">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                  <span>0{index + 1}</span>
                </div>
                <div className="shopify-card__body">
                  <h3>{localized.title}</h3>
                  <p className="shopify-card__label">{t.problem}</p>
                  <p>{localized.problem}</p>
                  <p className="shopify-card__label">{t.verified}</p>
                  <p>{localized.proof}</p>
                  <p className="shopify-card__technologies">
                    {item.technologies}
                  </p>
                  <div className="shopify-card__links">
                    <ExternalLink href={item.caseStudy} locale={locale}>
                      {t.caseStudy}
                    </ExternalLink>
                    <ExternalLink href={item.source} locale={locale}>
                      {t.source}
                    </ExternalLink>
                    {item.preview ? (
                      <ExternalLink href={item.preview} locale={locale}>
                        {t.preview}
                      </ExternalLink>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="shopify-architecture section container"
        aria-labelledby="shopify-architecture-title"
      >
        <div>
          <p className="eyebrow">{t.architectureEyebrow}</p>
          <h2 id="shopify-architecture-title">{t.architectureTitle}</h2>
          <p>{t.architectureText}</p>
        </div>
        <div
          className="shopify-architecture__flow"
          role="img"
          aria-label="Shopify GraphQL and webhooks flow through the embedded app to PostgreSQL, the mock warehouse, and merchant dashboard"
        >
          <span>Shopify GraphQL + webhooks</span>
          <span aria-hidden="true">↓</span>
          <strong>Embedded app</strong>
          <span aria-hidden="true">↓</span>
          <span>PostgreSQL · mock warehouse · dashboard</span>
        </div>
      </section>

      <aside
        className="shopify-boundaries container"
        aria-labelledby="shopify-boundaries-title"
      >
        <h2 id="shopify-boundaries-title">{t.noteTitle}</h2>
        <p>{t.noteText}</p>
      </aside>

      <section
        className="shopify-contact contact"
        aria-labelledby="shopify-contact-title"
      >
        <div className="contact__inner container">
          <p className="eyebrow">{t.ctaEyebrow}</p>
          <h2 id="shopify-contact-title">{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <a className="button button--inverted" href={contactHref}>
            {t.contact} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Mantenimiento y Confiabilidad de SaaS TypeScript",
  description:
    "Diagnóstico y estabilización por alcance para aplicaciones existentes con Next.js, React, Node.js, Supabase y PostgreSQL.",
  alternates: {
    canonical: "/es/servicios",
    languages: { en: "/services", es: "/es/servicios" },
  },
  openGraph: {
    title: "Mantenimiento y Confiabilidad de SaaS TypeScript",
    description:
      "Diagnóstico de causa raíz, correcciones enfocadas, cobertura de regresión y pull requests limpios para aplicaciones TypeScript existentes.",
    url: "/es/servicios",
  },
};

const services = [
  {
    number: "01",
    title: "Autenticación, acceso y límites de datos",
    problems:
      "Sesiones que desaparecen, ciclos de redirección, autorización incorrecta, usuarios que ven datos ajenos, aislamiento entre tenants y comportamiento de RLS en Supabase.",
    evidence:
      "Next: RLS en PostgreSQL, límites de datos privados y públicos, y comandos transaccionales.",
    href: "/es/work/next",
  },
  {
    number: "02",
    title: "Errores de API, base de datos y aplicación",
    problems:
      "Endpoints rotos, consultas incorrectas, solicitudes duplicadas, datos obsoletos, formularios, filtros, carreras de estado en React y fallos de backend Node.js.",
    evidence:
      "Reticle y Apache Maka: correcciones de comportamiento en repositorios TypeScript desconocidos.",
    href: "https://github.com/reticlehq/reticle/pull/278",
  },
  {
    number: "03",
    title: "Estabilidad de despliegue y entrega",
    problems:
      "Fallos de Vercel o build, problemas de entorno y CORS, CI fallido, pruebas inestables y falta de cobertura de regresión con Playwright o Vitest.",
    evidence:
      "BlueHex y Apache Fineract: cobertura de navegador y modernización de pruebas aceptadas upstream.",
    href: "https://github.com/codesydney/bluehex/pull/29",
  },
  {
    number: "04",
    title: "Estabilización de aplicaciones creadas con IA",
    problems:
      "Aplicaciones creadas o aceleradas con Lovable, Bolt, Replit, v0, Base44, Claude, Codex o herramientas similares que fallan en flujos reales.",
    evidence:
      "Verificación independiente del repositorio, comportamiento, permisos, límites de datos y pruebas de entrega.",
    href: "https://github.com/XonkelX",
  },
] as const;

const process = [
  "Envías los síntomas, issue, logs, capturas o contexto del repositorio.",
  "Reproduzco el comportamiento, identifico la causa raíz y defino un alcance acotado.",
  "Tras acordar el alcance, implemento el cambio enfocado en una rama.",
  "Valido el comportamiento y agrego cobertura de regresión cuando reduce el riesgo de repetición.",
  "Recibes un pull request limpio y una explicación concisa de la causa, la corrección y la evidencia.",
] as const;

export default function ServicesPageEs() {
  const emailHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Problema acotado de mantenimiento TypeScript")}`;

  return (
    <main id="main-content" className="page-shell">
      <section className="page-intro container">
        <p className="eyebrow">
          Mantenimiento y Confiabilidad de SaaS TypeScript
        </p>
        <h1>Corrijo y estabilizo aplicaciones web TypeScript existentes.</h1>
        <div className="page-intro__body">
          <p className="lede">
            Next.js, React, Node.js, Supabase y PostgreSQL: autenticación,
            permisos y RLS, APIs, datos, despliegues, regresiones y preparación
            de entregas.
          </p>
          <p>
            La aplicación ya existe. Inspecciono el código y el comportamiento,
            reproduzco el fallo, hago el cambio seguro más pequeño y documento
            la evidencia. No propongo una reescritura por defecto.
          </p>
          <div className="actions">
            <a className="button button--primary" href={emailHref}>
              Empezar con un problema acotado <span aria-hidden="true">→</span>
            </a>
            <Link
              className="button button--secondary"
              href="/es#codigo-abierto"
            >
              Revisar evidencia técnica
            </Link>
          </div>
        </div>
      </section>

      <section
        className="section service-families container"
        aria-labelledby="services-title-es"
      >
        <div className="section-heading">
          <p className="eyebrow">Problemas que atiendo</p>
          <h2 id="services-title-es">
            Mantenimiento basado en fallos observables.
          </h2>
        </div>
        <div className="service-family-list">
          {services.map((service) => (
            <article className="service-family" key={service.number}>
              <span>{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.problems}</p>
                {service.href.startsWith("/") ? (
                  <Link className="text-link" href={service.href}>
                    Evidencia: {service.evidence}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <ExternalLink
                    className="text-link"
                    href={service.href}
                    locale="es"
                  >
                    Evidencia: {service.evidence}
                  </ExternalLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section section--ruled current-focus container"
        aria-labelledby="process-title-es"
      >
        <p className="eyebrow">Un encargo acotado</p>
        <h2 id="process-title-es">
          Del síntoma a un cambio revisable y verificable.
        </h2>
        <ol>
          {process.map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="section service-ai container"
        aria-labelledby="ai-title-es"
      >
        <p className="eyebrow">Rescate de aplicaciones creadas con IA</p>
        <h2 id="ai-title-es">
          El desarrollo rápido también requiere verificación independiente.
        </h2>
        <div className="service-ai__body">
          <p>
            Si un prototipo creado con IA funciona casi siempre pero falla con
            usuarios reales, inspecciono el repositorio y el comportamiento.
            Reviso autenticación y límites de datos, reproduzco el fallo real y
            estabilizo la aplicación sin reemplazar lo que ya funciona.
          </p>
          <p>
            El valor está en asumir responsabilidad técnica: entender el
            sistema, revisar el diff, validar supuestos y dejar evidencia de
            regresión que otro desarrollador pueda mantener.
          </p>
        </div>
      </section>

      <section className="contact" aria-labelledby="services-contact-title-es">
        <div className="contact__inner container">
          <p className="eyebrow">
            Código existente · Alcance enfocado · Evidencia clara
          </p>
          <h2 id="services-contact-title-es">
            Empieza con el problema que te está bloqueando.
          </h2>
          <div className="actions">
            <a className="button button--inverted" href={emailHref}>
              Describir el problema <span aria-hidden="true">→</span>
            </a>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.githubUrl}
              locale="es"
            >
              Revisar mi código
            </ExternalLink>
          </div>
        </div>
      </section>
    </main>
  );
}

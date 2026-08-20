import type { Metadata } from "next";
import { ExternalLink } from "@/components/external-link";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Conoce a Oniel Alejo Feliz, desarrollador full-stack bilingüe en Tampa con experiencia en productos web, entrenamiento de IA, soporte técnico y código abierto.",
  alternates: {
    canonical: "/es/about",
    languages: { en: "/about", es: "/es/about" },
  },
};

const focus = [
  "Aplicaciones Next.js listas para producción",
  "Sistemas de interfaces accesibles",
  "Arquitectura de producto respaldada por PostgreSQL",
  "Movimiento e interacción en frontend",
] as const;

const experience = [
  {
    period: "2026 — Presente",
    title: "Colaborador de código abierto",
    organization: "Independiente",
    copy: "Contribuyo mejoras específicas a proyectos TypeScript establecidos en accesibilidad, automatización de navegador, persistencia y confiabilidad de herramientas.",
  },
  {
    period: "Experiencia previa",
    title: "Colaborador de entrenamiento de IA",
    organization: "Outlier",
    copy: "Trabajé de forma independiente con formatos y criterios cambiantes, fortaleciendo el razonamiento escrito, la consistencia y el control de calidad.",
  },
  {
    period: "Experiencia previa",
    title: "Técnico de reparación de computadoras",
    organization: "Taller local de computadoras",
    copy: "Diagnostiqué problemas de hardware y software, realicé reparaciones y expliqué soluciones prácticas con claridad a los clientes.",
  },
  {
    period: "Educación",
    title: "Estudios de desarrollo de software",
    organization: "ITLA · República Dominicana",
    copy: "Completé estudios de desarrollo de software en el Instituto Tecnológico de Las Américas.",
  },
] as const;

export default function SpanishAboutPage() {
  return (
    <main id="main-content" className="page-shell">
      <section className="page-intro container">
        <p className="eyebrow">Sobre mí / Oniel Alejo Feliz</p>
        <h1>
          Ingeniería confiable, diseñada para el <em>uso real.</em>
        </h1>
        <div className="page-intro__body">
          <p className="lede">
            Soy Oniel, desarrollador full-stack. Disfruto construir productos
            web que equilibran ingeniería confiable con un diseño claro y
            accesible.
          </p>
          <p>
            Trabajo en todo el stack: interfaces responsivas con React,
            autenticación, modelado relacional, pruebas y despliegue. Me
            interesan especialmente los productos donde una buena decisión
            técnica mejora directamente la experiencia del usuario.
          </p>
          <div className="actions">
            <a
              className="button button--primary"
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver currículum <span aria-hidden="true">↗</span>
            </a>
            <ExternalLink
              className="text-link"
              href={siteConfig.githubUrl}
              locale="es"
            >
              Revisar GitHub
            </ExternalLink>
          </div>
        </div>
      </section>

      <section
        className="about-grid container"
        aria-labelledby="approach-title-es"
      >
        <div>
          <p className="eyebrow">Cómo trabajo</p>
          <h2 id="approach-title-es">
            Pensamiento de producto sin perder rigor técnico.
          </h2>
        </div>
        <div className="prose">
          <p>
            Empiezo por la decisión que el usuario necesita tomar y diseño el
            sistema más pequeño que la respalde con claridad. Eso implica
            alcance deliberado, límites tipados, propiedad de datos predecible e
            interfaces útiles en distintos dispositivos y métodos de entrada.
          </p>
          <p>
            El trabajo no termina cuando una pantalla se ve bien. Valido el
            comportamiento con pruebas automatizadas, revisión por teclado,
            diseño responsivo, builds de producción y verificaciones de
            despliegue; después documento las decisiones y limitaciones con
            honestidad.
          </p>
        </div>
      </section>

      <section
        className="career-profile container"
        aria-labelledby="experience-title-es-about"
      >
        <div className="career-profile__heading">
          <p className="eyebrow">Experiencia + educación</p>
          <h2 id="experience-title-es-about">
            Profundidad técnica construida con trabajo real.
          </h2>
          <dl className="career-facts">
            <div>
              <dt>Ubicación</dt>
              <dd>Tampa, Florida</dd>
            </div>
            <div>
              <dt>Autorización laboral</dt>
              <dd>
                Residente permanente de EE. UU. · Sin patrocinio requerido
              </dd>
            </div>
            <div>
              <dt>Idiomas</dt>
              <dd>Español + inglés</dd>
            </div>
          </dl>
        </div>
        <div className="career-timeline">
          {experience.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <div>
                <p>{item.period}</p>
                <h3>{item.title}</h3>
                <strong>{item.organization}</strong>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="current-focus container"
        aria-labelledby="focus-title-es-about"
      >
        <p className="eyebrow">Enfoque actual</p>
        <h2 id="focus-title-es-about">
          Los sistemas detrás de experiencias de producto pulidas.
        </h2>
        <ol>
          {focus.map((item, index) => (
            <li key={item}>
              <span>0{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="availability container"
        aria-labelledby="availability-title-es"
      >
        <p className="eyebrow">
          Tampa, Florida · Disponible para oportunidades
        </p>
        <h2 id="availability-title-es">
          ¿Necesitas construir un producto web claro y útil?
        </h2>
        <p>
          Estoy disponible para roles de desarrollo full-stack o ingeniería de
          software en Tampa o remotos. Puedo trabajar en Estados Unidos sin
          patrocinio del empleador.
        </p>
        <div className="actions">
          <a
            className="button button--primary"
            href={`mailto:${siteConfig.email}`}
          >
            Escribirle a Oniel <span aria-hidden="true">→</span>
          </a>
          <ExternalLink
            className="text-link"
            href={siteConfig.githubUrl}
            locale="es"
          >
            Ver GitHub
          </ExternalLink>
          <a
            className="text-link"
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver currículum <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}

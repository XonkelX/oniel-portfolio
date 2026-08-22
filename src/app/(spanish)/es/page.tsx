import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { SectionHeading } from "@/components/section-heading";
import { spanishContributions } from "@/content/contributions-es";
import { spanishProjects } from "@/content/projects-es";
import { siteConfig } from "@/content/site";
import type { Project } from "@/types/project";

export const metadata: Metadata = {
  title: "Oniel Alejo Feliz — Desarrollador Full-Stack",
  description:
    "Productos web desplegados, contribuciones de código abierto y experiencia full-stack de Oniel Alejo Feliz.",
  alternates: {
    canonical: "/es",
    languages: { en: "/", es: "/es" },
  },
};

const proof = [
  { value: "04", label: "productos desplegados" },
  { value: "03", label: "contribuciones integradas" },
  { value: "Full stack", label: "de la interfaz a los datos" },
  { value: "Tampa · Remoto", label: "sin patrocinio requerido" },
] as const;

const capabilities = [
  { title: "Frontend", tools: "React · Next.js · TypeScript · UI accesible" },
  {
    title: "Backend",
    tools: "Node.js · APIs · Autenticación · Cloudflare Workers",
  },
  { title: "Datos", tools: "PostgreSQL · Prisma · Supabase · RLS" },
  { title: "Calidad", tools: "Playwright · Vitest · pgTAP · GitHub Actions" },
] as const;

const experience = [
  {
    period: "2026 — Hoy",
    role: "Colaborador de código abierto",
    detail:
      "Mejoras de accesibilidad, automatización de navegador y confiabilidad.",
  },
  {
    period: "Remoto",
    role: "Colaborador de entrenamiento de IA · Outlier",
    detail: "Evaluación técnica orientada a calidad en proyectos cambiantes.",
  },
  {
    period: "Experiencia previa",
    role: "Técnico de reparación de computadoras",
    detail: "Diagnóstico, reparación y comunicación clara con clientes.",
  },
] as const;

function projectLink(project: Project, kind: "live" | "source") {
  return project.links.find((item) => item.kind === kind)?.href;
}

function FeaturedProject({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const liveHref = projectLink(project, "live");
  const sourceHref = projectLink(project, "source");

  return (
    <article className="product-showcase reveal">
      <div className="product-showcase__media">
        <Image
          src={project.coverImage}
          alt={`Interfaz del producto ${project.name}`}
          width={1440}
          height={900}
          sizes="(max-width: 900px) 100vw, 58vw"
        />
        <span className="product-showcase__number">0{index + 1}</span>
      </div>
      <div className="product-showcase__copy">
        <p className="eyebrow">{project.category}</p>
        <h3>{project.name}</h3>
        <p className="product-showcase__summary">{project.summary}</p>
        <dl
          className="product-proof"
          aria-label={`Evidencia de ${project.name}`}
        >
          {project.evidence.slice(1).map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="actions">
          <Link
            className="button button--primary"
            href={`/es/work/${project.slug}`}
          >
            Caso de estudio <span aria-hidden="true">→</span>
          </Link>
          {liveHref ? (
            <ExternalLink className="text-link" href={liveHref} locale="es">
              Producto en vivo
            </ExternalLink>
          ) : null}
          {sourceHref ? (
            <ExternalLink className="text-link" href={sourceHref} locale="es">
              Código fuente
            </ExternalLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CompactProject({ project }: { project: Project }) {
  return (
    <article className="compact-project reveal">
      <Link
        className="compact-project__image"
        href={`/es/work/${project.slug}`}
        aria-label={`Ver el caso de estudio de ${project.name}`}
      >
        <Image
          src={project.coverImage}
          alt=""
          width={720}
          height={450}
          sizes="(max-width: 700px) 100vw, 42vw"
        />
      </Link>
      <div className="compact-project__body">
        <p className="eyebrow">{project.category}</p>
        <h3>{project.name}</h3>
        <p>{project.summary}</p>
        <div className="compact-project__footer">
          <span>{project.evidence[2].value}</span>
          <Link className="text-link" href={`/es/work/${project.slug}`}>
            Caso de estudio <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function SpanishHome() {
  const featuredProjects = spanishProjects.slice(0, 2);
  const supportingProjects = spanishProjects.slice(2);
  const featuredContributions = spanishContributions.slice(0, 4);

  return (
    <main id="main-content">
      <section className="home-hero container">
        <div className="home-hero__copy">
          <p className="eyebrow hero-enter hero-enter--1">
            Desarrollador Full-Stack · Tampa, Florida
          </p>
          <h1 className="hero-enter hero-enter--2">
            Construyo software que se mantiene <em>claro bajo presión.</em>
          </h1>
          <p className="home-hero__lede hero-enter hero-enter--3">
            Productos web desplegados, desde la interfaz hasta los datos.
          </p>
          <div className="actions hero-enter hero-enter--4">
            <a className="button button--primary" href="#proyectos">
              Explorar mis proyectos <span aria-hidden="true">↓</span>
            </a>
            <a
              className="button button--secondary"
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Currículum <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="home-hero__availability hero-enter hero-enter--5">
            <span aria-hidden="true" /> Disponible para roles full-stack y de
            software · Autorizado para trabajar en EE. UU.
          </p>
        </div>

        <aside className="portrait-card hero-enter hero-enter--3">
          <div className="portrait-card__image">
            <Image
              src="/oniel-alejo-feliz.jpg"
              alt="Oniel Alejo Feliz"
              fill
              priority
              sizes="(max-width: 900px) 92vw, 38vw"
            />
          </div>
          <div className="portrait-card__caption">
            <p>Oniel Alejo Feliz</p>
            <h2>Ingeniero con enfoque de producto</h2>
            <span>
              Interfaces accesibles. Reglas explícitas. Entregas probadas.
            </span>
          </div>
        </aside>
      </section>

      <section
        className="proof-strip container"
        aria-label="Evidencia del portafolio"
      >
        {proof.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section
        className="section container"
        id="proyectos"
        aria-labelledby="work-title-es"
      >
        <SectionHeading
          eyebrow="Proyectos seleccionados / 04"
          title="Primero el producto. La evidencia técnica, a un clic."
          id="work-title-es"
        />
        <div className="product-list">
          {featuredProjects.map((project, index) => (
            <FeaturedProject
              key={project.slug}
              project={project}
              index={index}
            />
          ))}
        </div>
        <div className="more-work">
          <div className="more-work__heading">
            <p className="eyebrow">Más trabajo publicado</p>
            <p>
              Otros dos sistemas con mentalidad de producción, presentados de un
              vistazo.
            </p>
          </div>
          <div className="compact-project-grid">
            {supportingProjects.map((project) => (
              <CompactProject key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="section open-source-section"
        id="codigo-abierto"
        aria-labelledby="open-source-title-es"
      >
        <div className="container">
          <SectionHeading
            eyebrow="Código abierto"
            title="Cambios útiles en bases de código que yo no diseñé."
            id="open-source-title-es"
          />
          <div className="contribution-grid">
            {featuredContributions.map((contribution, index) => (
              <article
                className="contribution-card reveal"
                key={contribution.href}
              >
                <div className="contribution-card__meta">
                  <span>0{index + 1}</span>
                  <span>{contribution.status}</span>
                </div>
                <p>{contribution.repository}</p>
                <h3>{contribution.title}</h3>
                <strong>{contribution.proof}</strong>
                <ExternalLink
                  className="text-link"
                  href={contribution.href}
                  locale="es"
                >
                  Revisar PR #{contribution.pullRequest}
                </ExternalLink>
              </article>
            ))}
          </div>
          <div className="open-source-section__footer">
            <p>Tres contribuciones integradas y una en revisión.</p>
            <ExternalLink
              className="text-link"
              href={siteConfig.githubUrl}
              locale="es"
            >
              Ver todo en GitHub
            </ExternalLink>
          </div>
        </div>
      </section>

      <section
        className="skills-band"
        id="habilidades"
        aria-labelledby="skills-title-es"
      >
        <div className="container">
          <div className="skills-band__heading">
            <p className="eyebrow">Rango técnico</p>
            <h2 id="skills-title-es">
              A través del stack, sin una pared de palabras de moda.
            </h2>
          </div>
          <div className="skill-rows">
            {capabilities.map((capability, index) => (
              <div key={capability.title} className="skill-row">
                <span>0{index + 1}</span>
                <strong>{capability.title}</strong>
                <p>{capability.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section experience-preview container"
        aria-labelledby="experience-title-es"
      >
        <div className="experience-preview__heading">
          <p className="eyebrow">Experiencia</p>
          <h2 id="experience-title-es">
            El recorrido de un constructor hacia el software.
          </h2>
          <Link className="text-link" href="/es/about">
            Sobre mí <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="experience-list">
          {experience.map((item) => (
            <article key={item.role}>
              <span>{item.period}</span>
              <div>
                <h3>{item.role}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="contact"
        id="contacto"
        aria-labelledby="contact-heading-es"
      >
        <div className="contact__inner container">
          <p className="eyebrow">Tampa · Remoto · Listo para contribuir</p>
          <h2 id="contact-heading-es">Construyamos algo útil.</h2>
          <div className="actions">
            <a
              className="button button--inverted"
              href={`mailto:${siteConfig.email}`}
            >
              Iniciar una conversación <span aria-hidden="true">→</span>
            </a>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.githubUrl}
              locale="es"
            >
              Revisar mi código
            </ExternalLink>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.linkedinUrl}
              locale="es"
            >
              Conectar en LinkedIn
            </ExternalLink>
          </div>
        </div>
      </section>
    </main>
  );
}

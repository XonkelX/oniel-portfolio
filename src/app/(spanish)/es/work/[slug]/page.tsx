import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "@/components/external-link";
import {
  getSpanishCaseStudy,
  spanishCaseStudies,
} from "@/content/case-studies-es";
import { getSpanishProject } from "@/content/projects-es";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return spanishCaseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getSpanishCaseStudy(slug);
  if (!study) return {};

  return {
    title: study.seoTitle,
    description: study.seoDescription,
    alternates: {
      canonical: `/es/work/${study.slug}`,
      languages: {
        en: `/work/${study.slug}`,
        es: `/es/work/${study.slug}`,
      },
    },
    openGraph: {
      title: `${study.seoTitle} — Oniel Alejo Feliz`,
      description: study.seoDescription,
      url: `/es/work/${study.slug}`,
      locale: "es_US",
      images: [
        {
          url: study.cover.src,
          width: study.cover.width,
          height: study.cover.height,
          alt: study.cover.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${study.seoTitle} — Oniel Alejo Feliz`,
      description: study.seoDescription,
      images: [study.cover.src],
    },
  };
}

function actionLabel(slug: string, name: string) {
  if (slug === "relay") return "Probar Failure Lab";
  return `Abrir ${name}`;
}

export default async function SpanishCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getSpanishCaseStudy(slug);
  const project = getSpanishProject(slug);
  if (!study || !project) notFound();

  const live = project.links.find((item) => item.kind === "live");
  const source = project.links.find((item) => item.kind === "source");
  const release = project.links.find((item) => item.kind === "release");
  const demo = project.links.find((item) => item.kind === "demo");

  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{project.category}</p>
        <div className="case-hero__title">
          <h1>{project.name}</h1>
          <span>{study.version}</span>
        </div>
        <p className="case-hero__summary">{study.summary}</p>
        <div className="actions">
          {live ? (
            <ExternalLink
              className="button button--primary"
              href={live.href}
              locale="es"
            >
              {actionLabel(study.slug, project.name)}
            </ExternalLink>
          ) : null}
          {source ? (
            <ExternalLink
              className="button button--secondary"
              href={source.href}
              locale="es"
            >
              Ver código fuente
            </ExternalLink>
          ) : null}
          {release ? (
            <ExternalLink className="text-link" href={release.href} locale="es">
              Versión v1.0
            </ExternalLink>
          ) : null}
          {demo ? (
            <ExternalLink className="text-link" href={demo.href} locale="es">
              Ver demostración
            </ExternalLink>
          ) : null}
        </div>
        <dl className="case-meta">
          {study.meta.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <figure className="case-cover container-wide">
        <Image
          src={study.cover.src}
          alt={study.cover.alt}
          width={study.cover.width}
          height={study.cover.height}
          sizes="100vw"
          priority
          quality={92}
        />
        <figcaption>{study.cover.caption}</figcaption>
      </figure>

      {study.sections.map((section, sectionIndex) => {
        const sectionId = `seccion-${sectionIndex + 1}`;
        const hasMedia = Boolean(section.media?.length);

        return (
          <section
            className={
              hasMedia ? "media-story container-wide" : "case-section container"
            }
            aria-labelledby={sectionId}
            key={`${section.eyebrow}-${section.title}`}
          >
            <header className={hasMedia ? "container" : undefined}>
              <p className="eyebrow">{section.eyebrow}</p>
              <h2 id={sectionId}>{section.title}</h2>
            </header>
            {section.lede ||
            section.paragraphs ||
            section.steps ||
            section.decisions ||
            section.quality ? (
              <div
                className={
                  hasMedia
                    ? "case-section__body container"
                    : "case-section__body"
                }
              >
                {section.lede ? <p className="lede">{section.lede}</p> : null}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.steps ? (
                  <ol
                    className="workflow"
                    aria-label={`Flujo de ${project.name}`}
                  >
                    {section.steps.map((step, index) => (
                      <li key={step}>
                        <span>0{index + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {section.decisions ? (
                  <div className="decision-list">
                    {section.decisions.map((decision, index) => (
                      <article key={decision.title}>
                        <span>0{index + 1}</span>
                        <h3>{decision.title}</h3>
                        <p>{decision.copy}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
                {section.quality ? (
                  <dl className="quality-grid">
                    {section.quality.map(([value, label]) => (
                      <div key={label}>
                        <dt>{value}</dt>
                        <dd>{label}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            ) : null}
            {section.media?.length ? (
              <>
                <figure className="media-wide">
                  <Image
                    src={section.media[0].src}
                    alt={section.media[0].alt}
                    width={section.media[0].width}
                    height={section.media[0].height}
                    sizes="100vw"
                    quality={92}
                  />
                  <figcaption>{section.media[0].caption}</figcaption>
                </figure>
                {section.media.length > 1 ? (
                  <div className="media-pair">
                    {section.media.slice(1).map((media) => (
                      <figure
                        className={
                          media.mobile ? "media-pair__mobile" : undefined
                        }
                        key={media.src}
                      >
                        <Image
                          src={media.src}
                          alt={media.alt}
                          width={media.width}
                          height={media.height}
                          sizes={
                            media.mobile
                              ? "375px"
                              : "(max-width: 768px) 100vw, 66vw"
                          }
                          quality={92}
                        />
                        <figcaption>{media.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        );
      })}

      <nav
        className="case-next container"
        aria-label="Navegación de casos de estudio"
      >
        <span>Fin del caso de estudio</span>
        <Link
          href={
            study.next.slug ? `/es/work/${study.next.slug}` : "/es#proyectos"
          }
        >
          {study.next.label} <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AdsShowcase } from "@/components/ads-showcase";
import { ExternalLink } from "@/components/external-link";
import { WorkList } from "@/components/work-list";
import {
  homeCopy,
  mergedPullRequestCount,
  mergedRepositories,
} from "@/content/home";
import { siteConfig, type Locale } from "@/content/site";
import "./vino-home.css";

function mailto(subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${siteConfig.email}${query}`;
}

export function VinoHome({ locale }: { locale: Locale }) {
  const t = homeCopy(locale);
  const prefix = locale === "es" ? "/es" : "";

  return (
    <main id="main-content" className="vino">
      <section className="vino-hero" aria-labelledby="vino-name">
        <div className="vino-wrap vino-hero__inner">
          <figure className="vino-hero__float">
            <Image
              src="/projects/ciento/ciento-home.png"
              alt={t.floatAlt}
              width={1440}
              height={900}
              priority
              sizes="(max-width: 900px) 86vw, 42vw"
            />
            <figcaption>{t.floatCaption}</figcaption>
          </figure>
          <h1 id="vino-name" className="vino-hero__name">
            <span className="vino-hero__first">Oniel</span>{" "}
            <span className="vino-hero__last">Alejo Feliz</span>
          </h1>
          <dl className="vino-hero__meta">
            {t.meta.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  {"live" in item ? (
                    <span className="vino-live" aria-hidden="true" />
                  ) : null}
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <AdsShowcase copy={t.ads} contactHref={mailto(t.ads.ctaSubject)} />

      <section
        className="vino-work"
        id={t.work.id}
        aria-labelledby="vino-work-title"
      >
        <div className="vino-wrap">
          <div className="vino-work__head">
            <h2 id="vino-work-title">{t.work.title}</h2>
            <span>{t.work.year}</span>
          </div>
          <WorkList
            items={t.work.items}
            hrefPrefix={`${prefix}/work/`}
            caseLabel={t.work.caseLabel}
          />
          <Link className="vino-more" href={`${prefix}/shopify`}>
            {t.work.more} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section
        className="vino-os"
        id={t.openSource.id}
        aria-labelledby="vino-os-title"
      >
        <div className="vino-wrap vino-os__grid">
          <p className="vino-os__num" aria-hidden="true">
            {mergedPullRequestCount}
          </p>
          <div>
            <h2 id="vino-os-title">
              <span className="sr-only">{mergedPullRequestCount} </span>
              {t.openSource.title}
            </h2>
            <ul className="vino-os__list">
              {mergedRepositories.map((repository) => (
                <li key={repository.href}>
                  <ExternalLink href={repository.href} locale={locale}>
                    {repository.name}
                  </ExternalLink>
                </li>
              ))}
            </ul>
            <ExternalLink
              className="vino-os__more"
              href={siteConfig.githubUrl}
              locale={locale}
            >
              {t.openSource.more}
            </ExternalLink>
          </div>
        </div>
      </section>

      <section
        className="vino-contact"
        id="contact"
        aria-labelledby="vino-contact-title"
      >
        <div className="vino-wrap">
          <h2 id="vino-contact-title">
            {t.contact.titleTop} <b>{t.contact.titleBottom}</b>
          </h2>
          <div className="vino-contact__actions">
            <a className="vino-btn vino-btn--dark" href={mailto()}>
              {t.contact.email}
            </a>
            <ExternalLink
              className="vino-btn"
              href={siteConfig.githubUrl}
              locale={locale}
            >
              GitHub
            </ExternalLink>
            <ExternalLink
              className="vino-btn"
              href={siteConfig.linkedinUrl}
              locale={locale}
            >
              LinkedIn
            </ExternalLink>
            <a
              className="vino-btn"
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t.contact.resume}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

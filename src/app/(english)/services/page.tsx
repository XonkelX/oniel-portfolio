import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "TypeScript SaaS Maintenance and Reliability",
  description:
    "Scoped diagnosis and stabilization for existing Next.js, React, Node.js, Supabase, and PostgreSQL applications, including auth, RLS, APIs, deployments, and regression coverage.",
  alternates: {
    canonical: "/services",
    languages: { en: "/services", es: "/es/servicios" },
  },
  openGraph: {
    title: "TypeScript SaaS Maintenance and Reliability",
    description:
      "Root-cause diagnosis, focused fixes, regression coverage, and clean pull requests for existing TypeScript applications.",
    url: "/services",
  },
};

const services = [
  {
    number: "01",
    title: "Auth, access, and data boundaries",
    problems:
      "Sessions that disappear, redirect loops, incorrect authorization, users seeing the wrong data, tenant isolation gaps, and Supabase RLS behavior.",
    evidence:
      "Next: PostgreSQL RLS, private and public data boundaries, and transactional commands.",
    href: "/work/next",
  },
  {
    number: "02",
    title: "API, database, and application bugs",
    problems:
      "Broken endpoints, incorrect query results, duplicate requests, stale data, forms, filters, React state races, and Node.js backend failures.",
    evidence:
      "Reticle and Apache Maka: behavioral fixes in unfamiliar TypeScript repositories.",
    href: "https://github.com/reticlehq/reticle/pull/278",
  },
  {
    number: "03",
    title: "Deployment and release stability",
    problems:
      "Vercel or build failures, environment and CORS problems, CI failures, flaky tests, and missing Playwright or Vitest regression coverage.",
    evidence:
      "BlueHex and Apache Fineract: browser coverage and test modernization accepted upstream.",
    href: "https://github.com/codesydney/bluehex/pull/29",
  },
  {
    number: "04",
    title: "AI-built application stabilization",
    problems:
      "Applications created or accelerated with Lovable, Bolt, Replit, v0, Base44, Claude, Codex, or similar tools that now fail under real workflows.",
    evidence:
      "Independent verification of the repository, runtime behavior, permissions, data boundaries, and release checks.",
    href: "https://github.com/XonkelX",
  },
] as const;

const process = [
  "Send the symptoms, issue, logs, screenshots, or repository context.",
  "I reproduce the behavior, identify the root cause, and define a bounded scope.",
  "After we agree on scope, I implement the focused change on a branch.",
  "I validate the behavior and add regression coverage when it reduces repeat risk.",
  "You receive a clean pull request and a concise explanation of the cause, fix, and evidence.",
] as const;

export default function ServicesPage() {
  const emailHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Scoped TypeScript maintenance issue")}`;

  return (
    <main id="main-content" className="page-shell">
      <section className="page-intro container">
        <p className="eyebrow">TypeScript SaaS Maintenance and Reliability</p>
        <h1>I fix and stabilize existing TypeScript web applications.</h1>
        <div className="page-intro__body">
          <p className="lede">
            Next.js, React, Node.js, Supabase, and PostgreSQL—authentication,
            permissions and RLS, APIs, data bugs, deployments, regressions, and
            release hardening.
          </p>
          <p>
            The application already exists. I inspect the code and production
            behavior, reproduce the failure, make the smallest safe change, and
            document the evidence. I do not sell a rewrite by default.
          </p>
          <div className="actions">
            <a className="button button--primary" href={emailHref}>
              Start with one scoped issue <span aria-hidden="true">→</span>
            </a>
            <Link className="button button--secondary" href="/#open-source">
              Review engineering proof
            </Link>
          </div>
        </div>
      </section>

      <section
        className="section service-families container"
        aria-labelledby="services-title"
      >
        <div className="section-heading">
          <p className="eyebrow">Problems I work on</p>
          <h2 id="services-title">
            Maintenance scoped around observable failures.
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
                    Evidence: {service.evidence}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <ExternalLink className="text-link" href={service.href}>
                    Evidence: {service.evidence}
                  </ExternalLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section section--ruled current-focus container"
        aria-labelledby="process-title"
      >
        <p className="eyebrow">A bounded engagement</p>
        <h2 id="process-title">From symptom to a reviewed, testable change.</h2>
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
        aria-labelledby="ai-title"
      >
        <p className="eyebrow">AI-built application rescue</p>
        <h2 id="ai-title">
          Rapid development still needs independent verification.
        </h2>
        <div className="service-ai__body">
          <p>
            If an AI-built prototype works most of the time but fails under real
            users, I inspect the actual repository and runtime behavior. I check
            auth and data boundaries, reproduce the real failure mode, and
            stabilize the application without replacing working parts.
          </p>
          <p>
            The value is engineering ownership: understanding the system,
            reviewing the diff, validating assumptions, and leaving regression
            evidence another developer can maintain.
          </p>
        </div>
      </section>

      <section className="contact" aria-labelledby="services-contact-title">
        <div className="contact__inner container">
          <p className="eyebrow">
            Existing codebase · Focused scope · Clear evidence
          </p>
          <h2 id="services-contact-title">
            Start with the issue that is blocking you.
          </h2>
          <div className="actions">
            <a className="button button--inverted" href={emailHref}>
              Describe the issue <span aria-hidden="true">→</span>
            </a>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.githubUrl}
            >
              Review my code
            </ExternalLink>
          </div>
        </div>
      </section>
    </main>
  );
}

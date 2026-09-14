import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { SectionHeading } from "@/components/section-heading";
import { openSourceContributions } from "@/content/contributions";
import { projects } from "@/content/projects";
import { siteConfig } from "@/content/site";
import type { Project } from "@/types/project";

const proof = [
  { value: "Maintainer reviewed", label: "merged upstream work" },
  { value: "Existing codebases", label: "diagnosis through regression" },
  { value: "TypeScript systems", label: "interface through data" },
  { value: "Tampa · Remote", label: "no sponsorship needed" },
] as const;

const capabilities = [
  {
    title: "Frontend",
    tools: "React · Next.js · TypeScript · Accessible UI",
  },
  {
    title: "Backend",
    tools: "Node.js · APIs · Auth · Cloudflare Workers",
  },
  {
    title: "Data",
    tools: "PostgreSQL · Prisma · Supabase · RLS",
  },
  {
    title: "Quality",
    tools: "Playwright · Vitest · pgTAP · GitHub Actions",
  },
] as const;

const experience = [
  {
    period: "2026 — Now",
    role: "Open-source contributor",
    detail: "Accessibility, browser automation, and reliability fixes.",
  },
  {
    period: "Remote",
    role: "AI training contributor · Outlier",
    detail: "Quality-focused technical evaluation across changing projects.",
  },
  {
    period: "Earlier",
    role: "Computer repair technician",
    detail: "Hands-on diagnosis, repair, and clear customer communication.",
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
          alt={`${project.name} product interface`}
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
        <dl className="product-proof" aria-label={`${project.name} evidence`}>
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
            href={`/work/${project.slug}`}
          >
            Case study <span aria-hidden="true">→</span>
          </Link>
          {liveHref ? (
            <ExternalLink className="text-link" href={liveHref}>
              Live product
            </ExternalLink>
          ) : null}
          {sourceHref ? (
            <ExternalLink className="text-link" href={sourceHref}>
              Source
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
        href={`/work/${project.slug}`}
        aria-label={`View ${project.name} case study`}
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
          <Link className="text-link" href={`/work/${project.slug}`}>
            Case study <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const featuredProjects = projects.slice(0, 2);
  const supportingProjects = projects.slice(2);
  const featuredContributions = openSourceContributions.slice(0, 5);

  return (
    <main id="main-content">
      <section className="home-hero container">
        <div className="home-hero__copy">
          <p className="eyebrow hero-enter hero-enter--1">
            Software Engineer · Tampa, Florida
          </p>
          <h1 className="hero-enter hero-enter--2">
            I fix, stabilize, and ship <em>TypeScript software.</em>
          </h1>
          <p className="home-hero__lede hero-enter hero-enter--3">
            Next.js, React, Node.js, and PostgreSQL—from existing-codebase bugs
            and failed deployments to authorization, APIs, data behavior, and
            regression coverage.
          </p>
          <div className="actions hero-enter hero-enter--4">
            <a className="button button--primary" href="#open-source">
              View engineering work <span aria-hidden="true">↓</span>
            </a>
            <Link className="button button--secondary" href="/services">
              Need a TypeScript app fixed? <span aria-hidden="true">→</span>
            </Link>
            <a
              className="button button--secondary"
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Résumé <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="home-hero__availability hero-enter hero-enter--5">
            <span aria-hidden="true" /> Available for software roles and scoped
            TypeScript maintenance · U.S. work authorized
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
            <h2>Software engineer</h2>
            <span>Existing codebases. Focused changes. Tested behavior.</span>
          </div>
        </aside>
      </section>

      <section
        className="proof-strip container"
        aria-label="Engineering evidence"
      >
        {proof.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section
        className="section open-source-section"
        id="open-source"
        aria-labelledby="open-source-title"
      >
        <div className="container">
          <SectionHeading
            eyebrow="Maintainer-reviewed open source"
            title="Evidence from codebases I did not design."
            id="open-source-title"
            intro="Each contribution started with an existing repository, a bounded problem, and upstream review. The links show the implementation, revisions, tests, and final status."
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
                <ExternalLink className="text-link" href={contribution.href}>
                  Review PR #{contribution.pullRequest}
                </ExternalLink>
              </article>
            ))}
          </div>
          <div className="open-source-section__footer">
            <p>
              Merged work across application persistence, runtime reliability,
              test modernization, browser regression coverage, accessibility,
              and navigation behavior. Open contributions remain labeled in
              review.
            </p>
            <ExternalLink className="text-link" href={siteConfig.githubUrl}>
              See all work on GitHub
            </ExternalLink>
          </div>
        </div>
      </section>

      <section
        className="section container"
        id="work"
        aria-labelledby="work-title"
      >
        <SectionHeading
          eyebrow="Selected engineering work"
          title="Systems that make the reliability work visible."
          id="work-title"
          intro="Relay leads with delivery and failure recovery. Next shows authorization and multi-user data boundaries. The remaining projects broaden the product and interface evidence."
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
            <p className="eyebrow">Additional work</p>
            <p>
              Three more systems, with implementation evidence one click in.
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
        className="section service-preview container"
        aria-labelledby="service-preview-title"
      >
        <div>
          <p className="eyebrow">TypeScript SaaS maintenance</p>
          <h2 id="service-preview-title">
            Your application exists. Something is failing.
          </h2>
        </div>
        <div className="service-preview__body">
          <p>
            I diagnose and stabilize auth, permissions, RLS, APIs, data
            fetching, React state, deployments, CI, and regression failures in
            existing Next.js, React, Node.js, Supabase, and PostgreSQL
            applications.
          </p>
          <p>
            This also includes independently reviewing AI-built or AI-assisted
            applications before real users depend on them.
          </p>
          <Link className="button button--primary" href="/services">
            Start with one scoped issue <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section
        className="skills-band"
        id="skills"
        aria-labelledby="skills-title"
      >
        <div className="container">
          <div className="skills-band__heading">
            <p className="eyebrow">Technical range</p>
            <h2 id="skills-title">
              Across the stack, without the buzzword wall.
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
        aria-labelledby="experience-title"
      >
        <div className="experience-preview__heading">
          <p className="eyebrow">Experience</p>
          <h2 id="experience-title">A builder’s path into software.</h2>
          <Link className="text-link" href="/about">
            About me <span aria-hidden="true">→</span>
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
        id="contact"
        aria-labelledby="contact-heading"
      >
        <div className="contact__inner container">
          <p className="eyebrow">Tampa · Remote · Ready to contribute</p>
          <h2 id="contact-heading">Let’s ship something useful.</h2>
          <div className="actions">
            <a
              className="button button--inverted"
              href={`mailto:${siteConfig.email}`}
            >
              Start a conversation <span aria-hidden="true">→</span>
            </a>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.githubUrl}
            >
              Review my code
            </ExternalLink>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.linkedinUrl}
            >
              Connect on LinkedIn
            </ExternalLink>
          </div>
        </div>
      </section>
    </main>
  );
}

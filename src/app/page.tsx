import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { SectionHeading } from "@/components/section-heading";
import { nextQueue, projects } from "@/content/projects";
import { siteConfig } from "@/content/site";
import type { Project } from "@/types/project";

const proof = [
  { value: "2", label: "production applications" },
  { value: "310", label: "documented release checks" },
  { value: "Full stack", label: "interface to database" },
  { value: "Open", label: "to Tampa + remote roles" },
] as const;

const capabilities = [
  {
    number: "01",
    title: "Product interfaces",
    copy: "React, Next.js, TypeScript, responsive UI, accessibility, motion, and clear interaction design.",
  },
  {
    number: "02",
    title: "Application systems",
    copy: "Authentication, Server Actions, APIs, PostgreSQL, Prisma, Supabase, relational modeling, and RLS.",
  },
  {
    number: "03",
    title: "Quality engineering",
    copy: "Vitest, Testing Library, Playwright, pgTAP, integration tests, production smoke checks, and documentation.",
  },
  {
    number: "04",
    title: "Production delivery",
    copy: "Vercel, GitHub Actions, Docker, database migrations, environment design, release validation, and operational limits.",
  },
] as const;

const process = [
  {
    number: "01",
    title: "Understand the decision",
    copy: "Start with what a user needs to accomplish and define the smallest workflow that makes that decision clear.",
  },
  {
    number: "02",
    title: "Design the system",
    copy: "Model ownership, permissions, data, failure states, and responsive behavior before polish hides structural problems.",
  },
  {
    number: "03",
    title: "Prove the release",
    copy: "Test the important boundaries, validate production behavior, and document tradeoffs without pretending limitations do not exist.",
  },
] as const;

function projectLink(project: Project, kind: "live" | "source") {
  const link = project.links.find((item) => item.kind === kind);
  if (!link) throw new Error(`Missing ${project.name} ${kind} link`);
  return link.href;
}

function ProductShowcase({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const caseStudyHref =
    project.slug === nextQueue.slug ? "/work/next" : "/work/careerflow";

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
        <ul className="product-highlights">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <div className="project-tags" aria-label={`${project.name} technology`}>
          {project.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <div className="actions">
          <Link className="button button--primary" href={caseStudyHref}>
            Read case study <span aria-hidden="true">→</span>
          </Link>
          <ExternalLink
            className="text-link"
            href={projectLink(project, "live")}
          >
            Live product
          </ExternalLink>
          <ExternalLink
            className="text-link"
            href={projectLink(project, "source")}
          >
            Source
          </ExternalLink>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero container">
        <div className="home-hero__copy">
          <p className="eyebrow hero-enter hero-enter--1">
            Full-Stack Developer · Tampa, Florida
          </p>
          <h1 className="hero-enter hero-enter--2">
            I turn complex workflows into <em>clear, dependable</em> products.
          </h1>
          <p className="home-hero__lede hero-enter hero-enter--3">
            I’m Oniel Alejo Feliz. I design and ship production web
            applications—from accessible React interfaces to authentication,
            relational data, testing, and deployment.
          </p>
          <div className="actions hero-enter hero-enter--4">
            <a className="button button--primary" href="#work">
              View selected work <span aria-hidden="true">↓</span>
            </a>
            <a
              className="button button--secondary"
              href={`mailto:${siteConfig.email}`}
            >
              Start a conversation
            </a>
          </div>
          <div className="home-hero__focus hero-enter hero-enter--5">
            <span>Current focus</span>
            <p>
              Real-time products, secure authorization, accessible systems, and
              release quality.
            </p>
          </div>
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
            <h2>Full-Stack Developer</h2>
            <span>
              Building thoughtful products across interface, application, and
              data layers.
            </span>
          </div>
          <span className="availability-pill">
            <span aria-hidden="true" /> Available for opportunities
          </span>
        </aside>
      </section>

      <section
        className="proof-strip container"
        aria-label="Portfolio evidence"
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
        id="work"
        aria-labelledby="work-title"
      >
        <SectionHeading
          eyebrow="Selected products / 02"
          title="Finished work, with the engineering visible."
          id="work-title"
          intro={
            <p>
              Two deployed products with real workflows, documented
              architecture, automated validation, and honest operational
              boundaries.
            </p>
          }
        />
        <div className="product-list">
          {projects.map((project, index) => (
            <ProductShowcase
              key={project.slug}
              project={project}
              index={index}
            />
          ))}
        </div>
      </section>

      <section
        className="section skills-section"
        id="skills"
        aria-labelledby="skills-title"
      >
        <div className="container">
          <SectionHeading
            eyebrow="Technical range"
            title="Useful across the stack."
            id="skills-title"
            intro={
              <p>
                My strongest work happens where product decisions, interface
                quality, application rules, and data integrity meet.
              </p>
            }
          />
          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article
                key={capability.number}
                className="capability-card reveal"
              >
                <span>{capability.number}</span>
                <h3>{capability.title}</h3>
                <p>{capability.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="process-title">
        <SectionHeading
          eyebrow="Working method"
          title="Product thinking, backed by engineering rigor."
          id="process-title"
        />
        <div className="process-list">
          {process.map((step) => (
            <article key={step.number} className="process-step reveal">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="about-statement container"
        aria-labelledby="about-title"
      >
        <div>
          <p className="eyebrow">About</p>
          <h2 id="about-title">
            I care about the details users feel—and the systems they never have
            to think about.
          </h2>
        </div>
        <div className="about-statement__copy">
          <p>
            I work from both directions: shaping a clear product experience in
            the browser while protecting it with explicit ownership, typed
            boundaries, predictable data behavior, and release evidence.
          </p>
          <p>
            I’m looking for a junior full-stack or software-development role
            where I can contribute immediately, learn from experienced
            engineers, and help a team ship useful software responsibly.
          </p>
          <Link className="text-link" href="/about">
            More about how I work <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section
        className="contact"
        id="contact"
        aria-labelledby="contact-heading"
      >
        <div className="contact__inner container">
          <p className="eyebrow">Tampa, Florida · Open to remote</p>
          <h2 id="contact-heading">Let’s build something people can trust.</h2>
          <p>
            I’m available for software-development opportunities and thoughtful
            product collaborations.
          </p>
          <div className="actions">
            <a
              className="button button--inverted"
              href={`mailto:${siteConfig.email}`}
            >
              Email Oniel <span aria-hidden="true">→</span>
            </a>
            <ExternalLink
              className="text-link text-link--inverted"
              href={siteConfig.githubUrl}
            >
              Review the code
            </ExternalLink>
          </div>
        </div>
      </section>
    </main>
  );
}

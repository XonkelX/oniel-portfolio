import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { ProjectCard } from "@/components/project-card";
import { ProjectVisual } from "@/components/project-visual";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/content/site";

const principles = [
  {
    number: "01",
    title: "Product clarity",
    copy: "Start with the user’s actual problem and remove anything that does not help solve it.",
  },
  {
    number: "02",
    title: "Reliable engineering",
    copy: "Build with explicit data ownership, typed boundaries, testing, and production validation.",
  },
  {
    number: "03",
    title: "Thoughtful interfaces",
    copy: "Use accessibility, responsive behavior, and motion as core product qualities—not finishing touches.",
  },
] as const;

const capabilities = [
  {
    title: "Frontend",
    items:
      "TypeScript, React, Next.js, HTML, CSS, responsive UI, accessibility, motion systems",
  },
  {
    title: "Backend",
    items:
      "Node.js, Express, REST APIs, authentication, PostgreSQL, Prisma, MongoDB",
  },
  {
    title: "Engineering",
    items:
      "Git and GitHub, automated testing, Docker, Linux, AWS fundamentals, deployment workflows",
  },
] as const;

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero container">
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="eyebrow hero-enter hero-enter--1">
              Full-Stack Developer · Tampa, Florida
            </p>
            <h1 className="hero-enter hero-enter--2">
              I build focused web products that feel <em>clear</em>, fast, and
              dependable.
            </h1>
            <p className="hero__lede hero-enter hero-enter--3">
              I’m Oniel Alejo Feliz, a full-stack developer focused on
              accessible interfaces, reliable application architecture, and
              thoughtful product design.
            </p>
            <div className="actions hero-enter hero-enter--4">
              <Link className="button button--primary" href="/work/careerflow">
                Explore CareerFlow <span aria-hidden="true">→</span>
              </Link>
              <ExternalLink
                className="button button--secondary"
                href={siteConfig.githubUrl}
              >
                View GitHub
              </ExternalLink>
            </div>
          </div>
          <div className="hero__index" aria-label="Portfolio introduction">
            <span>Selected work / 01</span>
            <span>Available for opportunities</span>
          </div>
        </div>
        <div className="hero__visual hero-enter hero-enter--5">
          <ProjectVisual />
        </div>
      </section>

      <section
        className="section container"
        id="work"
        aria-labelledby="work-title"
      >
        <SectionHeading
          eyebrow="Selected work / 01"
          title="One product, examined in full."
          id="work-title"
          intro={
            <p>
              A focused case study of product thinking, full-stack
              implementation, and release quality.
            </p>
          }
        />
        <ProjectCard />
      </section>

      <section
        className="section section--ruled container"
        aria-labelledby="approach-heading"
      >
        <SectionHeading
          eyebrow="Approach"
          title="Built from the problem outward."
          id="approach-heading"
        />
        <div className="principles">
          {principles.map((principle) => (
            <article key={principle.number} className="principle reveal">
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section capabilities container"
        aria-labelledby="capabilities-heading"
      >
        <SectionHeading
          eyebrow="Capabilities"
          title="Across the application stack."
          id="capabilities-heading"
        />
        <div className="capability-list">
          {capabilities.map((capability) => (
            <div key={capability.title} className="capability-row reveal">
              <h3>{capability.title}</h3>
              <p>{capability.items}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="section about-preview container"
        aria-labelledby="about-preview-heading"
      >
        <p className="eyebrow">About</p>
        <div>
          <h2 id="about-preview-heading">
            Frontend detail. Backend discipline.
          </h2>
          <p>
            I’m a full-stack developer based in Tampa, Florida. I enjoy turning
            ambiguous product ideas into focused applications with
            understandable interfaces and maintainable systems.
          </p>
          <p>
            My work combines responsive design and accessibility with
            authentication, relational data modeling, testing, and production
            deployment.
          </p>
          <Link className="text-link" href="/about">
            More about my approach <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section
        className="contact"
        id="contact"
        aria-labelledby="contact-heading"
      >
        <div className="contact__inner container">
          <p className="eyebrow">Have a project or opportunity?</p>
          <h2 id="contact-heading">Let’s build something useful.</h2>
          <p>
            I’m open to software-development opportunities and conversations
            about thoughtful web products.
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
              GitHub profile
            </ExternalLink>
          </div>
        </div>
      </section>
    </main>
  );
}

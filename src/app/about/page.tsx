import type { Metadata } from "next";
import { ExternalLink } from "@/components/external-link";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Oniel Alejo Feliz, a full-stack developer in Tampa focused on dependable engineering and accessible product design.",
  alternates: { canonical: "/about" },
};

const focus = [
  "Production-ready Next.js applications",
  "Accessible interface systems",
  "PostgreSQL-backed product architecture",
  "Frontend motion and interaction design",
] as const;

export default function AboutPage() {
  return (
    <main id="main-content" className="page-shell">
      <section className="page-intro container">
        <p className="eyebrow">About / Oniel Alejo Feliz</p>
        <h1>
          Dependable engineering, shaped around <em>real use.</em>
        </h1>
        <div className="page-intro__body">
          <p className="lede">
            I’m Oniel, a full-stack developer who enjoys building web products
            that balance dependable engineering with clear, accessible design.
          </p>
          <p>
            I work across the application stack—from responsive React interfaces
            to authentication, relational data modeling, testing, and
            deployment. I’m especially interested in products where good
            technical decisions directly improve the user experience.
          </p>
        </div>
      </section>

      <section
        className="about-grid container"
        aria-labelledby="approach-title"
      >
        <div>
          <p className="eyebrow">How I work</p>
          <h2 id="approach-title">
            Product thinking without losing engineering rigor.
          </h2>
        </div>
        <div className="prose">
          <p>
            I like to begin with the decision a user is trying to make, then
            design the smallest system that supports it clearly. That means
            deliberate scope, typed boundaries, predictable data ownership, and
            interfaces that remain useful across devices and input methods.
          </p>
          <p>
            The work is not finished when a screen looks right. I validate
            behavior with automated tests, keyboard and responsive review,
            production builds, and deployment checks—then document the tradeoffs
            honestly.
          </p>
        </div>
      </section>

      <section
        className="current-focus container"
        aria-labelledby="focus-title"
      >
        <p className="eyebrow">Current focus</p>
        <h2 id="focus-title">
          The systems behind polished product experiences.
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
        aria-labelledby="availability-title"
      >
        <p className="eyebrow">Tampa, Florida · Available for opportunities</p>
        <h2 id="availability-title">
          Interested in building a clear, useful web product?
        </h2>
        <p>
          I’m open to software-development roles and thoughtful product
          conversations.
        </p>
        <div className="actions">
          <a
            className="button button--primary"
            href={`mailto:${siteConfig.email}`}
          >
            Email Oniel <span aria-hidden="true">→</span>
          </a>
          <ExternalLink className="text-link" href={siteConfig.githubUrl}>
            View GitHub
          </ExternalLink>
        </div>
      </section>
    </main>
  );
}

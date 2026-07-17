import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { careerFlow, getProjectLink } from "@/content/projects";

export const metadata: Metadata = {
  title: "CareerFlow Case Study",
  description:
    "How CareerFlow brings application tracking, deadlines, dashboard insight, and resume versions into one production-deployed full-stack product.",
  alternates: { canonical: "/work/careerflow" },
  openGraph: {
    title: "CareerFlow Case Study — Oniel Alejo Feliz",
    description:
      "Product design, full-stack architecture, release validation, and deployment behind CareerFlow v1.0.",
    url: "/work/careerflow",
  },
};

const projectMetadata = [
  ["Role", careerFlow.role],
  ["Status", careerFlow.status],
  ["Platform", "Web"],
  ["Deployment", "Vercel and Neon"],
  ["Repository", "Public"],
  ["Year", String(careerFlow.year)],
] as const;

const decisions = [
  {
    title: "Credentials authentication and JWT sessions",
    copy: "Auth.js Credentials authentication uses encrypted JWT sessions because database-session support is not used for this provider strategy. It is a fit for this architecture, not a universal default.",
  },
  {
    title: "Ownership isolation",
    copy: "Every application and resume operation is scoped to the authenticated user on the server. Knowing another record’s URL or identifier is never authorization to read or change it.",
  },
  {
    title: "Money in minor units",
    copy: "Salary ranges are stored in ISO 4217 minor units, then formatted with the runtime’s internationalization support to avoid floating-point currency errors.",
  },
  {
    title: "A consistent date model",
    copy: "Version 1.0 uses UTC consistently instead of introducing partially implemented user-time-zone behavior.",
  },
  {
    title: "Resume families and versions",
    copy: "A shared resume family can contain independently labeled versions, and each application can reference the version used for that opportunity.",
  },
  {
    title: "Stable migration history",
    copy: "Once deployment history was established, existing database migrations were retained rather than rewritten for presentation convenience.",
  },
] as const;

const quality = [
  [
    "179",
    "passing tests with the PostgreSQL-backed release environment enabled",
  ],
  [
    "150 + 29",
    "default passing tests plus database-gated tests in the full baseline",
  ],
  ["0", "known npm audit vulnerabilities at the v1.0 release checkpoint"],
] as const;

function CaseSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="case-section container"
      aria-labelledby={`section-${number}`}
    >
      <header>
        <p className="eyebrow">{number}</p>
        <h2 id={`section-${number}`}>{title}</h2>
      </header>
      <div className="case-section__body">{children}</div>
    </section>
  );
}

export default function CareerFlowPage() {
  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{careerFlow.category}</p>
        <div className="case-hero__title">
          <h1>CareerFlow</h1>
          <span>2026 / v1.0</span>
        </div>
        <p className="case-hero__summary">
          A production-deployed application for organizing job opportunities,
          application progress, deadlines, and targeted resume versions.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href={getProjectLink("live").href}
          >
            Visit live product
          </ExternalLink>
          <ExternalLink
            className="button button--secondary"
            href={getProjectLink("source").href}
          >
            View source
          </ExternalLink>
          <a className="text-link" href="#demo">
            Watch preview ↓
          </a>
          <ExternalLink
            className="text-link"
            href={getProjectLink("release").href}
          >
            v1.0 release
          </ExternalLink>
        </div>
        <dl className="case-meta">
          {projectMetadata.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <figure className="case-cover container-wide">
        <Image
          src={careerFlow.coverImage}
          alt="CareerFlow dashboard showing five application records summarized by status, interview conversion, upcoming deadlines, and recently updated opportunities"
          width={1440}
          height={1592}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          quality={92}
        />
        <figcaption>
          CareerFlow dashboard · Production portfolio data
        </figcaption>
      </figure>

      <CaseSection number="01" title="The problem">
        <p className="lede">
          A serious job search quickly produces more information than a simple
          list can handle: opportunities at different stages, follow-up dates,
          salary ranges, deadlines, and multiple resume versions.
        </p>
        <p>
          That information often fragments across notes, bookmarks,
          spreadsheets, calendars, and files. CareerFlow was designed to bring
          the workflow into one focused, account-scoped system without turning
          it into a noisy productivity suite.
        </p>
      </CaseSection>

      <CaseSection number="02" title="The product">
        <p>
          The central workflow follows an opportunity from first capture to
          final outcome while keeping the resume used for that application
          connected to the record.
        </p>
        <ol className="workflow" aria-label="CareerFlow product workflow">
          {[
            "Register and sign in",
            "Save an opportunity",
            "Track status and dates",
            "Search and filter",
            "Review dashboard insight",
            "Connect a resume version",
          ].map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </CaseSection>

      <section
        className="media-story container-wide"
        aria-labelledby="experience-title"
      >
        <header className="container">
          <p className="eyebrow">03</p>
          <h2 id="experience-title">Product experience</h2>
        </header>
        <figure className="media-wide">
          <Image
            src="/projects/careerflow/careerflow-applications-desktop.png"
            alt="CareerFlow applications page with server-side search, combined filters, status labels, salary ranges, and deadline dates"
            width={1440}
            height={1193}
            sizes="100vw"
            quality={92}
          />
          <figcaption>
            Search and combined filters keep a growing opportunity list
            actionable.
          </figcaption>
        </figure>
        <div className="media-pair">
          <figure>
            <Image
              src="/projects/careerflow/careerflow-application-form.png"
              alt="CareerFlow new-application form filled with fictional company, role, salary, and deadline information"
              width={1440}
              height={1000}
              sizes="(max-width: 768px) 100vw, 66vw"
              quality={90}
            />
            <figcaption>
              A structured editor captures only what the user knows now.
            </figcaption>
          </figure>
          <figure className="media-pair__mobile">
            <Image
              src="/projects/careerflow/careerflow-dashboard-mobile.png"
              alt="CareerFlow dashboard adapted to a 375 pixel mobile viewport"
              width={375}
              height={812}
              sizes="375px"
              quality={92}
            />
            <figcaption>
              The full workflow remains reachable at mobile width.
            </figcaption>
          </figure>
        </div>
        <figure className="media-wide media-wide--light">
          <Image
            src="/projects/careerflow/careerflow-resumes-desktop.png"
            alt="CareerFlow resume library showing a concise resume and two independently labeled software-engineering versions"
            width={1440}
            height={1000}
            sizes="100vw"
            quality={92}
          />
          <figcaption>
            Resume families preserve shared identity while versions remain
            specific.
          </figcaption>
        </figure>
      </section>

      <CaseSection number="04" title="Architecture">
        <p>
          CareerFlow is one Next.js application: React interfaces and Server
          Components call server-owned application logic, Auth.js establishes
          identity, and Prisma persists owned data in PostgreSQL on Neon. Vercel
          hosts the application and health endpoint.
        </p>
        <div
          className="architecture"
          role="img"
          aria-label="Architecture flow from browser through Next.js and Auth.js to Prisma and PostgreSQL on Neon"
        >
          <div>
            <span>Interface</span>
            <strong>React browser UI</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Application</span>
            <strong>Next.js on Vercel</strong>
            <small>Server Components · Actions · routes</small>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Identity + data</span>
            <strong>Auth.js + Prisma</strong>
            <small>Credentials · JWT sessions</small>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Persistence</span>
            <strong>PostgreSQL on Neon</strong>
          </div>
        </div>
      </CaseSection>

      <CaseSection number="05" title="Important engineering decisions">
        <div className="decision-list">
          {decisions.map((decision, index) => (
            <article key={decision.title}>
              <span>0{index + 1}</span>
              <h3>{decision.title}</h3>
              <p>{decision.copy}</p>
            </article>
          ))}
        </div>
      </CaseSection>

      <CaseSection number="06" title="Quality and validation">
        <p>
          The release-readiness suite completed with 179 passing tests when the
          PostgreSQL-backed test environment was enabled. The default suite
          reports 150 passing tests and gates 29 database tests until that
          disposable environment is available.
        </p>
        <dl className="quality-grid">
          {quality.map(([value, label]) => (
            <div key={value}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <p>
          Validation also covered the production build, migration application,
          authentication and protected routes, ownership isolation, desktop and
          mobile browser behavior, and an accessibility review. These are
          release-baseline results, not a claim that the software is formally
          certified or bug-free.
        </p>
      </CaseSection>

      <CaseSection number="07" title="Accessibility">
        <p>
          Accessibility was treated as product behavior: semantic controls,
          keyboard navigation, visible focus, managed dialogs, connected
          validation errors, an accessible mobile drawer, screen-reader labels,
          and reduced-motion awareness.
        </p>
        <p>
          The work was reviewed across common keyboard and responsive paths; it
          is not presented as formal WCAG certification.
        </p>
      </CaseSection>

      <CaseSection number="08" title="Deployment and operations">
        <p>
          The portfolio release runs within a zero-cost operating constraint on
          Vercel Hobby and Neon Free. Production environment variables are
          encrypted by the hosting platform, and a minimal health endpoint
          checks database readiness without disclosing connection data.
        </p>
        <ul className="limitations">
          <li>Free-tier provider quotas apply.</li>
          <li>
            Neon may scale to zero, so the first request after inactivity can be
            slower.
          </li>
          <li>
            Authentication rate limiting is process-local rather than shared
            infrastructure.
          </li>
          <li>
            The release is a portfolio deployment, not a commercial service with
            an SLA.
          </li>
        </ul>
      </CaseSection>

      <section
        className="demo-section container-wide"
        id="demo"
        aria-labelledby="demo-title"
      >
        <div className="demo-section__heading container">
          <p className="eyebrow">09 / Product preview</p>
          <h2 id="demo-title">Ten seconds through the core workspace.</h2>
          <p>
            The silent preview shows the dashboard, opportunity tracking,
            application editor, and resume organization. The adjacent text
            provides the same overview without requiring playback.
          </p>
        </div>
        <video
          controls
          muted
          playsInline
          preload="none"
          poster="/projects/careerflow/careerflow-video-poster.png"
          aria-label="Silent ten-second preview of the CareerFlow product interface"
        >
          <source
            src="/projects/careerflow/careerflow-preview.mp4"
            type="video/mp4"
          />
          Your browser does not support embedded video.
        </video>
        <p className="demo-section__link">
          <ExternalLink href={getProjectLink("demo").href}>
            Watch the complete 105-second demo
          </ExternalLink>
        </p>
      </section>

      <CaseSection number="10" title="Result">
        <p className="lede">
          CareerFlow demonstrates the complete product lifecycle: scoped product
          design, authentication, relational data, responsive and accessible
          interfaces, automated testing, deployment, and honest release
          documentation.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href={getProjectLink("live").href}
          >
            Open CareerFlow
          </ExternalLink>
          <ExternalLink
            className="text-link"
            href={getProjectLink("source").href}
          >
            View repository
          </ExternalLink>
          <ExternalLink
            className="text-link"
            href={getProjectLink("demo").href}
          >
            Watch complete demo
          </ExternalLink>
          <ExternalLink
            className="text-link"
            href={getProjectLink("release").href}
          >
            Inspect v1.0 release
          </ExternalLink>
        </div>
      </CaseSection>

      <nav className="case-next container" aria-label="Case study navigation">
        <span>End of case study</span>
        <Link href="/#work">
          Back to selected work <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </main>
  );
}

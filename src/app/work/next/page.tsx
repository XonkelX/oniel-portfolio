import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { nextQueue } from "@/content/projects";

export const metadata: Metadata = {
  title: "Next Real-Time Queue System",
  description:
    "Product, architecture, authorization, realtime synchronization, and release validation behind Next by Oniel Alejo Feliz.",
  alternates: { canonical: "/work/next" },
};

const decisions = [
  {
    title: "Database-enforced commands",
    copy: "Browser clients cannot write queue tables directly. Every mutation crosses an explicit PostgreSQL function that authorizes the actor and applies one atomic state change.",
  },
  {
    title: "Realtime as invalidation",
    copy: "Realtime messages tell clients that something changed; each client then fetches a revisioned authoritative snapshot and ignores stale responses.",
  },
  {
    title: "Idempotent transitions",
    copy: "Every command receives a request UUID. Safe replays return the current result while mismatched reuse is rejected before state can diverge.",
  },
  {
    title: "Privacy by separation",
    copy: "Public displays expose queue numbers only. Optional customer names live in a private table and are available only to authorized staff.",
  },
] as const;

const quality = [
  ["34", "unit and component checks"],
  ["62", "database authorization checks"],
  ["11", "Supabase integration checks"],
  ["15", "browser workflow checks"],
  ["9", "production smoke checks"],
] as const;

function link(kind: "live" | "source") {
  const item = nextQueue.links.find((candidate) => candidate.kind === kind);
  if (!item) throw new Error(`Missing Next ${kind} link`);
  return item.href;
}

export default function NextCaseStudy() {
  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{nextQueue.category}</p>
        <div className="case-hero__title">
          <h1>Next</h1>
          <span>Production v1.0 / 2026</span>
        </div>
        <p className="case-hero__summary">
          One synchronized answer to three questions: who is waiting, who is
          being served, and who is next.
        </p>
        <div className="actions">
          <ExternalLink className="button button--primary" href={link("live")}>
            Open live product
          </ExternalLink>
          <ExternalLink
            className="button button--secondary"
            href={link("source")}
          >
            View source
          </ExternalLink>
        </div>
        <dl className="case-meta">
          <div>
            <dt>Role</dt>
            <dd>Product design + full-stack engineering</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>Next.js · Supabase · PostgreSQL</dd>
          </div>
          <div>
            <dt>Quality</dt>
            <dd>131 documented release checks</dd>
          </div>
        </dl>
      </section>

      <figure className="case-cover container-wide">
        <Image
          src="/projects/next-queue/landing-page.png"
          alt="Next real-time queue system landing page"
          width={1440}
          height={900}
          priority
        />
        <figcaption>Next · Production landing experience</figcaption>
      </figure>

      <section className="case-section container">
        <header>
          <p className="eyebrow">The product</p>
          <h2>A small workflow with three distinct audiences.</h2>
        </header>
        <div className="case-section__body">
          <p className="lede">
            Paper lists and shouted names create uncertainty for customers and
            unnecessary coordination for staff.
          </p>
          <p>
            Next gives customers a stable queue number and position, staff a
            focused command board, and public displays a privacy-safe view of
            the active number. All three experiences share persistent state and
            converge without manual refresh.
          </p>
          <ol className="workflow">
            <li>
              <span>01</span>Create a queue and receive a one-time staff
              capability
            </li>
            <li>
              <span>02</span>Let customers join without permanent accounts
            </li>
            <li>
              <span>03</span>Call, complete, skip, pause, reopen, or close from
              staff view
            </li>
            <li>
              <span>04</span>Keep customer and public displays synchronized
              safely
            </li>
          </ol>
        </div>
      </section>

      <section className="media-story container-wide">
        <header className="container">
          <p className="eyebrow">Product experience</p>
          <h2>Purpose-built views, one authoritative queue.</h2>
        </header>
        <figure className="media-wide">
          <Image
            src="/projects/next-queue/staff-board.png"
            alt="Next staff board with waiting, serving, and completed queue entries"
            width={1440}
            height={900}
          />
          <figcaption>
            Staff board · Authorized queue commands and live state
          </figcaption>
        </figure>
        <div className="media-pair">
          <figure>
            <Image
              src="/projects/next-queue/customer-status.png"
              alt="Customer queue status with number and position"
              width={1440}
              height={900}
            />
            <figcaption>
              Customer status · Position, connection, and turn feedback
            </figcaption>
          </figure>
          <figure className="media-pair__mobile">
            <Image
              src="/projects/next-queue/mobile-view.png"
              alt="Next customer queue interface on mobile"
              width={375}
              height={812}
            />
            <figcaption>Responsive mobile experience</figcaption>
          </figure>
        </div>
      </section>

      <section className="case-section container">
        <header>
          <p className="eyebrow">Architecture</p>
          <h2>Authorization and consistency live with the data.</h2>
        </header>
        <div className="case-section__body">
          <p>
            Next.js serves the interface from Vercel. Supabase provides
            anonymous authentication, PostgreSQL, RPC access, and filtered
            Realtime signals. The browser receives public configuration only;
            privileged credentials never enter the application runtime.
          </p>
          <div className="decision-list">
            {decisions.map((decision, index) => (
              <article key={decision.title}>
                <span>0{index + 1}</span>
                <h3>{decision.title}</h3>
                <p>{decision.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section container">
        <header>
          <p className="eyebrow">Release evidence</p>
          <h2>Quality measured across the complete system.</h2>
        </header>
        <div className="case-section__body">
          <p>
            The release was validated at the interface, domain, database,
            integration, browser, and production layers without counting the
            focused Realtime subset twice.
          </p>
          <dl className="quality-grid quality-grid--five">
            {quality.map(([count, label]) => (
              <div key={label}>
                <dt>{count}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
          <p>
            The project documentation also records free-tier limits, anonymous
            identity tradeoffs, recovery constraints, and deployment boundaries
            instead of presenting a portfolio release as an enterprise service.
          </p>
        </div>
      </section>

      <div className="case-next container">
        <span>Next project</span>
        <Link href="/work/careerflow">Explore CareerFlow →</Link>
      </div>
    </main>
  );
}

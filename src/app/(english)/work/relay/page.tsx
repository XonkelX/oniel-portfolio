import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { relay } from "@/content/projects";

export const metadata: Metadata = {
  title: "Relay Case Study",
  description:
    "How Relay makes outbound webhook delivery durable, signed, retryable, and operationally inspectable on Cloudflare.",
  alternates: {
    canonical: "/work/relay",
    languages: { en: "/work/relay", es: "/es/work/relay" },
  },
  openGraph: {
    title: "Relay Case Study — Oniel Alejo Feliz",
    description:
      "Distributed delivery architecture, failure handling, security, operational evidence, and production validation behind Relay v1.0.",
    url: "/work/relay",
  },
};

const projectMetadata = [
  ["Role", relay.role],
  ["Status", relay.status],
  ["Platform", "Cloudflare Workers"],
  ["Topology", "Workers, D1, Queues, Cron"],
  ["Repository", "Public"],
  ["Year", String(relay.year)],
] as const;

const decisions = [
  {
    title: "At least once over false exactly once",
    copy: "A stable webhook ID gives receivers an idempotency key while lease recovery accepts that duplicate network delivery can occur.",
  },
  {
    title: "Transactional outbox over dual writes",
    copy: "Event acceptance, endpoint fanout, and publication intent commit together so accepted work cannot disappear between the database and queue.",
  },
  {
    title: "D1 scheduling plus Queue transport",
    copy: "D1 owns due time, retry policy, and recovery. Queue messages remain compact wake-ups for work that is ready now.",
  },
  {
    title: "Evidence as product behavior",
    copy: "Every delivery attempt records bounded, redacted evidence, making retries, replay lineage, and terminal outcomes inspectable from the console.",
  },
  {
    title: "Controlled public failure injection",
    copy: "Failure Lab exposes seven fixed receiver behaviors behind Turnstile and quotas without accepting arbitrary URLs or payloads.",
  },
  {
    title: "Free-only production topology",
    copy: "Two Workers, D1, Queues, Cron, Turnstile, and a Service Binding demonstrate the system without paid infrastructure or hidden trial dependencies.",
  },
] as const;

const quality = [
  ["283", "application and shared-contract tests"],
  ["12", "browser, accessibility, and responsive journeys"],
  ["9", "publishing, production-config, and provisioning checks"],
] as const;

function projectLink(kind: "live" | "source" | "release" | "demo") {
  const link = relay.links.find((item) => item.kind === kind);
  if (!link) throw new Error(`Missing Relay ${kind} link`);
  return link.href;
}

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

export default function RelayPage() {
  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{relay.category}</p>
        <div className="case-hero__title">
          <h1>Relay</h1>
          <span>2026 / v1.0</span>
        </div>
        <p className="case-hero__summary">
          A production webhook delivery platform that turns retries, receiver
          failures, signatures, and recovery into a durable lifecycle operators
          can inspect instead of infer.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href={projectLink("live")}
          >
            Open Failure Lab
          </ExternalLink>
          <ExternalLink
            className="button button--secondary"
            href={projectLink("source")}
          >
            View source
          </ExternalLink>
          <ExternalLink className="text-link" href={projectLink("release")}>
            v1.0 release
          </ExternalLink>
          <ExternalLink className="text-link" href={projectLink("demo")}>
            Watch demo
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
          src="/projects/relay/relay-landing.png"
          alt="Relay landing page introducing inspectable webhook delivery infrastructure"
          width={1280}
          height={1112}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          quality={92}
        />
        <figcaption>Relay v1.0 · Production delivery infrastructure</figcaption>
      </figure>

      <CaseSection number="01" title="The reliability problem">
        <p className="lede">
          Sending one HTTP request is easy. Preserving delivery intent through
          timeouts, rate limits, process interruption, secret rotation, and
          incident review is a distributed-systems problem.
        </p>
        <p>
          Relay was designed so an accepted event always has durable work behind
          it, retries remain bounded and explainable, receivers can deduplicate
          requests, and operators have enough evidence to understand every
          outcome.
        </p>
      </CaseSection>

      <CaseSection number="02" title="Architecture">
        <p>
          D1 is the durable source of truth. The Queue transports ready delivery
          identifiers, while a scheduled Worker republishes due outbox work,
          recovers expired leases, and applies bounded retention.
        </p>
        <div
          className="architecture"
          role="img"
          aria-label="Architecture flow from event producer through Relay, D1, Queue, and signed receiver delivery"
        >
          <div>
            <span>Ingress</span>
            <strong>Authenticated event</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Durability</span>
            <strong>D1 transaction</strong>
            <small>Event · fanout · outbox</small>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Transport</span>
            <strong>Cloudflare Queue</strong>
            <small>Lease · classify · reschedule</small>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Destination</span>
            <strong>Signed receiver</strong>
            <small>Stable webhook identity</small>
          </div>
        </div>
      </CaseSection>

      <section
        className="media-story container-wide"
        aria-labelledby="evidence-title"
      >
        <header className="container">
          <p className="eyebrow">03</p>
          <h2 id="evidence-title">Operational evidence</h2>
        </header>
        <figure className="media-wide">
          <Image
            src="/projects/relay/relay-delivery-inspector.png"
            alt="Relay delivery inspector showing two transient HTTP 503 attempts followed by a successful HTTP 200 attempt"
            width={1280}
            height={1740}
            sizes="100vw"
            loading="eager"
            quality={92}
          />
          <figcaption>
            One delivery, three persisted attempts, and the exact retry story in
            one view.
          </figcaption>
        </figure>
      </section>

      <CaseSection number="04" title="Important engineering decisions">
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

      <section
        className="media-story container-wide"
        aria-labelledby="failure-lab-title"
      >
        <header className="container">
          <p className="eyebrow">05 / Public demonstration</p>
          <h2 id="failure-lab-title">
            Break the receiver. Watch Relay recover.
          </h2>
        </header>
        <figure className="media-wide media-wide--light">
          <Image
            src="/projects/relay/relay-failure-lab.png"
            alt="Relay Failure Lab with seven safe deterministic receiver failure scenarios"
            width={1280}
            height={1454}
            sizes="100vw"
            loading="eager"
            quality={92}
          />
          <figcaption>
            Seven controlled scenarios make success, retry, rate limiting,
            timeout, permanent failure, and exhaustion observable in production.
          </figcaption>
        </figure>
      </section>

      <CaseSection number="06" title="Quality and production proof">
        <p>
          The release combines application tests, database-backed Worker tests,
          browser journeys, responsive and accessibility coverage, publishing
          safety, cost guardrails, and a controlled production retry run.
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
          In production, the flaky receiver returned HTTP 500 twice and HTTP 200
          on the third attempt. Relay preserved one webhook identity, generated
          fresh signatures, and recorded each receiver receipt.
        </p>
      </CaseSection>

      <CaseSection number="07" title="Result">
        <p className="lede">
          Relay demonstrates production reasoning beyond CRUD: transactional
          boundaries, concurrency control, cryptographic handling, failure
          classification, cost-aware operations, and evidence-backed delivery.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href={projectLink("live")}
          >
            Try Failure Lab
          </ExternalLink>
          <ExternalLink className="text-link" href={projectLink("source")}>
            Inspect repository
          </ExternalLink>
          <ExternalLink className="text-link" href={projectLink("release")}>
            Read release notes
          </ExternalLink>
        </div>
      </CaseSection>

      <nav className="case-next container" aria-label="Case study navigation">
        <span>Next case study</span>
        <Link href="/work/next">Explore Next →</Link>
      </nav>
    </main>
  );
}

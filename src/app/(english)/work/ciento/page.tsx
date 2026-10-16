import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { ciento } from "@/content/projects";

export const metadata: Metadata = {
  title: "Ciento Case Study",
  description:
    "A careful look at Oniel Alejo Feliz's product engineering contributions to Ciento's Business and Member experiences.",
  alternates: {
    canonical: "/work/ciento",
    languages: { en: "/work/ciento", es: "/es/work/ciento" },
  },
  openGraph: {
    title: "Ciento Case Study — Oniel Alejo Feliz",
    description:
      "Collaborative product engineering across responsive membership experiences, interaction quality, and release-focused validation.",
    url: "/work/ciento",
    images: [
      {
        url: ciento.coverImage,
        width: 1440,
        height: 900,
        alt: "Ciento public homepage",
      },
    ],
  },
};

const contributions = [
  {
    title: "Cross-device product journeys",
    copy: "Refined responsive Business and Member experiences so navigation, controls, and important states remain clear across desktop and mobile surfaces.",
  },
  {
    title: "Focused interaction work",
    copy: "Improved onboarding, selection controls, media handling, and core membership interactions within the product's established visual system.",
  },
  {
    title: "Release-minded maintenance",
    copy: "Delivered scoped fixes through pull requests, revisited regressions after integration, and validated affected browser paths before considering the work complete.",
  },
] as const;

function liveProduct() {
  const link = ciento.links.find((item) => item.kind === "live");
  if (!link) throw new Error("Missing Ciento live product link");
  return link.href;
}

export default function CientoCaseStudy() {
  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{ciento.category}</p>
        <div className="case-hero__title">
          <h1>Ciento</h1>
          <span>Active collaboration / 2026</span>
        </div>
        <p className="case-hero__summary">
          Product engineering contributions to an active membership platform
          serving both businesses and members.
        </p>
        <div className="actions">
          <ExternalLink className="button button--primary" href={liveProduct()}>
            Open live product
          </ExternalLink>
        </div>
        <dl className="case-meta">
          <div>
            <dt>Role</dt>
            <dd>Product engineering contributor</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>Collaborative product development</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Business + Member experience</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Active product</dd>
          </div>
        </dl>
      </section>

      <figure className="case-cover container-wide">
        <Image
          src={ciento.coverImage}
          alt="Ciento public homepage presenting memberships and benefits"
          width={1440}
          height={900}
          sizes="100vw"
          priority
          quality={92}
        />
        <figcaption>
          Ciento · Public membership experience at ciento.me
        </figcaption>
      </figure>

      <section className="case-section container">
        <header>
          <p className="eyebrow">01 / Product context</p>
          <h2>One membership experience for two sides of the product.</h2>
        </header>
        <div className="case-section__body">
          <p className="lede">
            Ciento connects members with benefits from the businesses they
            choose, while giving businesses a dedicated product surface for
            managing that relationship.
          </p>
          <p>
            My work takes place inside an existing, actively developed product.
            The goal is not to replace its direction, but to move defined
            experiences forward while preserving established behavior and the
            work of other contributors.
          </p>
        </div>
      </section>

      <section className="case-section container">
        <header>
          <p className="eyebrow">02 / Contribution</p>
          <h2>Improvements that fit the product already in motion.</h2>
        </header>
        <div className="case-section__body">
          <div className="decision-list">
            {contributions.map((contribution, index) => (
              <article key={contribution.title}>
                <span>0{index + 1}</span>
                <h3>{contribution.title}</h3>
                <p>{contribution.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section container">
        <header>
          <p className="eyebrow">03 / Collaboration</p>
          <h2>Working through bounded changes, review, and integration.</h2>
        </header>
        <div className="case-section__body">
          <p>
            Contributions are separated into focused branches and pull requests.
            Each change is evaluated against the current product, updated when
            integration exposes a regression, and kept within the boundaries of
            the assigned experience.
          </p>
          <p>
            This work demonstrates collaboration in a shared codebase: reading
            existing behavior, respecting product decisions, communicating the
            scope of a fix, and maintaining continuity across releases.
          </p>
        </div>
      </section>

      <section className="case-section container">
        <header>
          <p className="eyebrow">04 / Public boundary</p>
          <h2>A useful case study without exposing private product details.</h2>
        </header>
        <div className="case-section__body">
          <p>
            This case study intentionally uses only Ciento&apos;s public landing
            experience and a high-level description of my contribution. It does
            not reproduce private dashboards, account information, operational
            data, internal architecture, or unreleased product behavior.
          </p>
          <div className="actions">
            <ExternalLink
              className="button button--primary"
              href={liveProduct()}
            >
              Visit Ciento
            </ExternalLink>
          </div>
        </div>
      </section>

      <nav className="case-next container" aria-label="Case study navigation">
        <span>Next case study</span>
        <Link href="/work/relay">Explore Relay →</Link>
      </nav>
    </main>
  );
}

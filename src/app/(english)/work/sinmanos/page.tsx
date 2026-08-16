import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { sinManos } from "@/content/projects";

export const metadata: Metadata = {
  title: "SinManos League of Legends Analytics",
  description:
    "Product design, Riot API integration, champion analytics, and the original visual system behind SinManos by Oniel Alejo Feliz.",
  alternates: {
    canonical: "/work/sinmanos",
    languages: { en: "/work/sinmanos", es: "/es/work/sinmanos" },
  },
};

const decisions = [
  {
    title: "LAN-first scope",
    copy: "The product stays focused on the Latin America North server and prioritizes the workflows that matter most: Solo/Duo, ARAM, champions, and Riot ID lookup.",
  },
  {
    title: "Server-side Riot access",
    copy: "Riot credentials stay inside a Cloudflare Worker. The browser receives only the response it needs and never handles the API key directly.",
  },
  {
    title: "Static and live data separated",
    copy: "Data Dragon supplies stable game assets while live player requests use Riot endpoints, reducing unnecessary API calls and keeping the interface responsive.",
  },
  {
    title: "A recognizable visual language",
    copy: "Dry-brush masks, sharp silhouettes, oversized typography, and a restrained cyan, red, and yellow palette give the product an identity of its own.",
  },
] as const;

export default function SinManosCaseStudy() {
  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{sinManos.category}</p>
        <div className="case-hero__title">
          <h1>SinManos</h1>
          <span>Public beta / 2026</span>
        </div>
        <p className="case-hero__summary">
          A focused League of Legends companion for LAN players—designed to make
          tier lists, champion guidance, and match history fast to scan without
          inheriting the visual language of larger analytics sites.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href="https://sinmanos.site"
          >
            Open SinManos
          </ExternalLink>
        </div>
        <dl className="case-meta">
          <div>
            <dt>Role</dt>
            <dd>Product design + full-stack engineering</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>React · TypeScript · Cloudflare Workers</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>Riot API · Data Dragon · LAN</dd>
          </div>
        </dl>
      </section>

      <figure className="case-cover container-wide">
        <Image
          src="/projects/sinmanos/home.png"
          alt="SinManos landing page with Solo Q, Tier List, and ARAM destinations"
          width={1600}
          height={1000}
          priority
        />
        <figcaption>SinManos · Three focused paths into the product</figcaption>
      </figure>

      <section className="case-section container">
        <header>
          <p className="eyebrow">The brief</p>
          <h2>Turn a familiar stats product into a distinct LAN experience.</h2>
        </header>
        <div className="case-section__body">
          <p className="lede">
            The challenge was not simply to reproduce a large analytics site. It
            was to understand the useful structure behind one and rebuild it as
            a smaller, original product with a clear audience.
          </p>
          <p>
            SinManos combines champion discovery, build guidance, and player
            lookup in one public interface. The visual system deliberately uses
            brush textures, asymmetrical masks, and strong typographic contrast
            to make dense game data feel energetic without becoming difficult to
            navigate.
          </p>
        </div>
      </section>

      <section className="media-story container-wide">
        <header className="container">
          <p className="eyebrow">Product experience</p>
          <h2>From league-wide patterns to one champion or one player.</h2>
        </header>
        <figure className="media-wide">
          <Image
            src="/projects/sinmanos/ranked.png"
            alt="SinManos ranked tier list with role leaders and filters"
            width={1600}
            height={1000}
          />
          <figcaption>
            Ranked overview · Role leaders, filters, and tier-list context
          </figcaption>
        </figure>
        <div className="media-pair">
          <figure>
            <Image
              src="/projects/sinmanos/champion.png"
              alt="SinManos champion guide for Ekko with build and rune guidance"
              width={1600}
              height={1000}
            />
            <figcaption>
              Champion guide · Build, runes, counters, and skill progression
            </figcaption>
          </figure>
          <figure>
            <Image
              src="/projects/sinmanos/player.png"
              alt="SinManos LAN Riot ID player search experience"
              width={1600}
              height={1000}
            />
            <figcaption>
              Player lookup · A LAN-focused Riot ID workflow
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="case-section container">
        <header>
          <p className="eyebrow">Architecture</p>
          <h2>Public game assets and protected live requests.</h2>
        </header>
        <div className="case-section__body">
          <p>
            The React client is deployed as a fast static application. A
            Cloudflare Worker owns Riot API access, validates requests, and
            keeps the development or production key outside the browser. Data
            Dragon provides champion, item, spell, rune, and splash-art assets.
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
          <p className="eyebrow">Current scope</p>
          <h2>A small product with an honest data boundary.</h2>
        </header>
        <div className="case-section__body">
          <p>
            Player lookup and match-history flows are built around Riot data.
            Champion-analysis surfaces can be presented as curated product views
            while broader aggregation access is being finalized. The interface
            makes that boundary explicit instead of presenting sample analytics
            as live facts.
          </p>
        </div>
      </section>

      <div className="case-next container">
        <span>Next project</span>
        <Link href="/work/relay">Explore Relay →</Link>
      </div>
    </main>
  );
}

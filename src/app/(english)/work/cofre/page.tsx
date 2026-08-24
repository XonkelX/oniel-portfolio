import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { cofre } from "@/content/projects";

export const metadata: Metadata = {
  title: "Cofre Case Study",
  description:
    "Product design, local-first storage, Windows integration, and release validation behind Cofre, a keyboard-first link manager.",
  alternates: {
    canonical: "/work/cofre",
    languages: { en: "/work/cofre", es: "/es/work/cofre" },
  },
  openGraph: {
    title: "Cofre Case Study — Oniel Alejo Feliz",
    description:
      "How a one-keystroke capture workflow became a private, searchable Windows link library.",
    url: "/work/cofre",
    images: [{ url: cofre.coverImage, width: 470, height: 602 }],
  },
};

const projectMetadata = [
  ["Role", cofre.role],
  ["Status", cofre.status],
  ["Platform", "Windows 10 and 11"],
  ["Storage", "Local SQLite"],
  ["Repository", "Public"],
  ["Year", String(cofre.year)],
] as const;

const decisions = [
  {
    title: "Capture without filing",
    copy: "Copying a URL is the save action. Cofre classifies the domain after capture so the user does not have to choose a folder first.",
  },
  {
    title: "Retrieval over accumulation",
    copy: "Titles, complete URLs, websites, content types, favorites, and personal notes share one search surface.",
  },
  {
    title: "Local-first by default",
    copy: "SQLite keeps the library on the device, while versioned JSON backups provide explicit portability without requiring an account.",
  },
  {
    title: "Native behavior with a small footprint",
    copy: "Tauri provides clipboard monitoring, system tray behavior, autostart, notifications, single-instance recovery, and an NSIS installer.",
  },
] as const;

function projectLink(kind: "source" | "release") {
  const link = cofre.links.find((item) => item.kind === kind);
  if (!link) throw new Error(`Missing Cofre ${kind} link`);
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

export default function CofrePage() {
  return (
    <main id="main-content" className="case-study">
      <section className="case-hero container">
        <p className="eyebrow">{cofre.category}</p>
        <div className="case-hero__title">
          <h1>Cofre</h1>
          <span>2026 / v0.1.0</span>
        </div>
        <p className="case-hero__summary">
          A compact Windows app that turns one familiar action, copying a URL,
          into a private link library organized for retrieval instead of filing.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href={projectLink("release")}
          >
            Download Windows release
          </ExternalLink>
          <ExternalLink
            className="button button--secondary"
            href={projectLink("source")}
          >
            View source
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
          src="/projects/cofre/library.png"
          alt="Cofre Windows link library with automatically organized website categories"
          width={470}
          height={602}
          sizes="(max-width: 700px) 94vw, 720px"
          priority
          quality={92}
        />
        <figcaption>Cofre v0.1.0 · Compact local link library</figcaption>
      </figure>

      <CaseSection number="01" title="The capture problem">
        <p className="lede">
          Saving a link often interrupts the reason it was worth saving: choose
          a folder, name it, and decide where it belongs before returning to the
          original task.
        </p>
        <p>
          Cofre removes that decision from capture. A copied web URL is saved,
          classified by website, enriched with useful metadata, and made
          available through one search field.
        </p>
      </CaseSection>

      <CaseSection number="02" title="One action from capture to retrieval">
        <ol className="workflow" aria-label="Cofre link workflow">
          <li>
            <span>01</span>Copy a URL with Ctrl+C.
          </li>
          <li>
            <span>02</span>Cofre validates, normalizes, and stores it.
          </li>
          <li>
            <span>03</span>The website category and favicon appear
            automatically.
          </li>
          <li>
            <span>04</span>Search the title, URL, website, type, or personal
            note later.
          </li>
        </ol>
      </CaseSection>

      <section
        className="media-story container-wide"
        aria-labelledby="notes-title"
      >
        <header className="container">
          <p className="eyebrow">03 / Product interaction</p>
          <h2 id="notes-title">Context without clutter</h2>
        </header>
        <div className="case-section__body container">
          <p>
            A compact note bubble expands inside the selected link only when it
            is needed. Notes persist locally, travel in backups, and participate
            in the same search as link metadata.
          </p>
        </div>
        <figure className="media-wide">
          <Image
            src="/projects/cofre/notes.png"
            alt="Expanded Cofre note editor attached to a saved GitHub link"
            width={470}
            height={602}
            sizes="(max-width: 700px) 94vw, 720px"
            quality={92}
          />
          <figcaption>
            Notes add memory to a saved URL without adding another workspace.
          </figcaption>
        </figure>
      </section>

      <CaseSection number="04" title="Engineering decisions">
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
        aria-labelledby="settings-title"
      >
        <header className="container">
          <p className="eyebrow">05 / Windows behavior</p>
          <h2 id="settings-title">Quiet until needed</h2>
        </header>
        <div className="case-section__body container">
          <p>
            Cofre can remain in the system tray, capture automatically, show a
            compact confirmation, exclude selected domains, and optionally start
            with Windows. Duplicate behavior and motion remain user-controlled.
          </p>
        </div>
        <figure className="media-wide">
          <Image
            src="/projects/cofre/settings.png"
            alt="Cofre settings for Windows autostart, capture, notifications, duplicates, and excluded websites"
            width={468}
            height={600}
            sizes="(max-width: 700px) 94vw, 720px"
            quality={92}
          />
          <figcaption>
            Native integration remains explicit and reversible.
          </figcaption>
        </figure>
      </section>

      <CaseSection number="06" title="Release validation">
        <p>
          The release was tested as an installed Windows application, including
          clipboard capture, duplicate notifications, search, minimize, maximize
          and restore, close-to-tray recovery, single-instance launch, upgrade
          preservation, and autostart path repair.
        </p>
        <dl className="quality-grid">
          <div>
            <dt>16</dt>
            <dd>frontend behavior tests</dd>
          </div>
          <div>
            <dt>4</dt>
            <dd>Rust parsing and safety tests</dd>
          </div>
          <div>
            <dt>1</dt>
            <dd>clean Windows GitHub CI pipeline</dd>
          </div>
        </dl>
      </CaseSection>

      <CaseSection number="07" title="Result">
        <p className="lede">
          Cofre demonstrates product judgment beyond the browser: a focused
          workflow, local data ownership, native Windows integration, schema
          migration, packaging, and evidence-backed release testing.
        </p>
        <div className="actions">
          <ExternalLink
            className="button button--primary"
            href={projectLink("release")}
          >
            Open v0.1.0 release
          </ExternalLink>
          <ExternalLink className="text-link" href={projectLink("source")}>
            Inspect repository
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

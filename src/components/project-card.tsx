import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { ProjectVisual } from "@/components/project-visual";
import { careerFlow, getProjectLink } from "@/content/projects";

export function ProjectCard() {
  return (
    <article className="project-card reveal">
      <div className="project-card__copy">
        <p className="eyebrow">Featured project · Full-stack product</p>
        <h3>{careerFlow.name}</h3>
        <p className="project-card__summary">{careerFlow.summary}</p>
        <dl className="project-card__evidence">
          <div>
            <dt>Release</dt>
            <dd>Production v1.0 · 2026</dd>
          </div>
          <div>
            <dt>Baseline</dt>
            <dd>179 database-backed tests</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{careerFlow.technologies.join(" · ")}</dd>
          </div>
        </dl>
        <div className="actions">
          <Link className="button button--primary" href="/work/careerflow">
            Read case study <span aria-hidden="true">→</span>
          </Link>
          <ExternalLink
            className="text-link"
            href={getProjectLink("live").href}
          >
            Live application
          </ExternalLink>
          <ExternalLink
            className="text-link"
            href={getProjectLink("source").href}
          >
            Source
          </ExternalLink>
        </div>
      </div>
      <ProjectVisual compact />
    </article>
  );
}

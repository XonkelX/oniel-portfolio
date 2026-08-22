import { describe, expect, it } from "vitest";
import {
  careerFlow,
  getProjectLink,
  nextQueue,
  projects,
  relay,
  sinManos,
} from "@/content/projects";
import { openSourceContributions } from "@/content/contributions";
import { navigation, siteConfig } from "@/content/site";
import { spanishNavigation } from "@/content/site";
import { spanishProjects } from "@/content/projects-es";
import { spanishContributions } from "@/content/contributions-es";

describe("portfolio content configuration", () => {
  it("contains four featured projects with complete media", () => {
    expect(projects).toHaveLength(4);
    expect(sinManos.featured).toBe(true);
    expect(relay.featured).toBe(true);
    expect(careerFlow.featured).toBe(true);
    expect(nextQueue.featured).toBe(true);
    expect(careerFlow.coverImage).toMatch(/^\/projects\/careerflow\/.+\.png$/);
    expect(careerFlow.mobileImage).toMatch(/^\/projects\/careerflow\/.+\.png$/);
    expect(nextQueue.coverImage).toMatch(/^\/projects\/next-queue\/.+\.png$/);
    expect(nextQueue.mobileImage).toMatch(/^\/projects\/next-queue\/.+\.png$/);
    expect(relay.coverImage).toMatch(/^\/projects\/relay\/.+\.png$/);
    expect(relay.mobileImage).toMatch(/^\/projects\/relay\/.+\.png$/);
    expect(sinManos.coverImage).toMatch(/^\/projects\/sinmanos\/.+\.png$/);
    expect(sinManos.mobileImage).toMatch(/^\/projects\/sinmanos\/.+\.png$/);
  });

  it("provides every required public CareerFlow destination", () => {
    for (const kind of ["live", "source", "release", "demo"] as const) {
      expect(getProjectLink(kind).href).toMatch(/^https:\/\//);
    }
    expect(getProjectLink("release").href).toContain("v1.0.0");
  });

  it("provides a recruiter-focused navigation and resume", () => {
    expect(navigation.map((item) => item.label)).toEqual([
      "Home",
      "Work",
      "Open source",
      "Skills",
      "About",
    ]);
    expect(siteConfig.resumeUrl).toMatch(/\.pdf$/);
    expect(siteConfig.linkedinUrl).toContain("linkedin.com/in/");
    expect(spanishNavigation.map((item) => item.label)).toEqual([
      "Inicio",
      "Proyectos",
      "Código abierto",
      "Habilidades",
      "Sobre mí",
    ]);
  });

  it("provides complete Spanish project and contribution content", () => {
    expect(spanishProjects).toHaveLength(projects.length);
    expect(
      spanishProjects.every((project) => project.summary.length > 50),
    ).toBe(true);
    expect(spanishContributions).toHaveLength(openSourceContributions.length);
    expect(
      spanishContributions.filter((item) => item.status === "Integrado"),
    ).toHaveLength(3);
  });

  it("links every open-source contribution to its upstream pull request", () => {
    expect(openSourceContributions).toHaveLength(4);
    for (const contribution of openSourceContributions) {
      expect(contribution.href).toMatch(
        new RegExp(`/pull/${contribution.pullRequest}$`),
      );
      expect(contribution.proof.length).toBeGreaterThan(20);
    }
  });
});

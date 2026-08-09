import { describe, expect, it } from "vitest";
import {
  careerFlow,
  getProjectLink,
  nextQueue,
  projects,
  relay,
} from "@/content/projects";
import { navigation, siteConfig } from "@/content/site";

describe("portfolio content configuration", () => {
  it("contains three featured projects with complete media", () => {
    expect(projects).toHaveLength(3);
    expect(relay.featured).toBe(true);
    expect(careerFlow.featured).toBe(true);
    expect(nextQueue.featured).toBe(true);
    expect(careerFlow.coverImage).toMatch(/^\/projects\/careerflow\/.+\.png$/);
    expect(careerFlow.mobileImage).toMatch(/^\/projects\/careerflow\/.+\.png$/);
    expect(nextQueue.coverImage).toMatch(/^\/projects\/next-queue\/.+\.png$/);
    expect(nextQueue.mobileImage).toMatch(/^\/projects\/next-queue\/.+\.png$/);
    expect(relay.coverImage).toMatch(/^\/projects\/relay\/.+\.png$/);
    expect(relay.mobileImage).toMatch(/^\/projects\/relay\/.+\.png$/);
  });

  it("provides every required public CareerFlow destination", () => {
    for (const kind of ["live", "source", "release", "demo"] as const) {
      expect(getProjectLink(kind).href).toMatch(/^https:\/\//);
    }
    expect(getProjectLink("release").href).toContain("v1.0.0");
  });

  it("uses the expected navigation and intentionally omits a resume", () => {
    expect(navigation.map((item) => item.label)).toEqual([
      "Home",
      "Work",
      "Skills",
      "About",
      "Contact",
    ]);
    expect(siteConfig.resumeUrl).toBeNull();
  });
});

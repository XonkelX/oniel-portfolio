import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("motion safeguards", () => {
  it("keeps reduced-motion content visible and removes transitions", () => {
    const css = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/\.reveal[\s\S]*transform:\s*none\s*!important/);
    expect(css).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});

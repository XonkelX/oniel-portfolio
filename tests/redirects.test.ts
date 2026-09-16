import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("legacy portfolio hostname", () => {
  it("permanently redirects every path to the canonical domain", async () => {
    expect(nextConfig.redirects).toBeTypeOf("function");

    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "oniel-portfolio.vercel.app" }],
      destination: "https://onielalejofeliz.space/:path*",
      permanent: true,
    });
  });
});

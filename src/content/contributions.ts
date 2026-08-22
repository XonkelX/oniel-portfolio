export type OpenSourceContribution = {
  repository: string;
  title: string;
  summary: string;
  proof: string;
  href: string;
  pullRequest: number;
  status: "Merged" | "In review";
};

export const openSourceContributions: readonly OpenSourceContribution[] = [
  {
    repository: "Reticle",
    title: "Persistent learned routes",
    summary:
      "Added bounded, batched route persistence for crawls and ordinary navigation while preserving learned flows, run history, and concurrent updates.",
    proof: "Merged after full cross-platform CI, E2E, and maintainer review",
    href: "https://github.com/reticlehq/reticle/pull/278",
    pullRequest: 278,
    status: "Merged",
  },
  {
    repository: "Code.Sydney / BlueHex",
    title: "Production-build browser coverage",
    summary:
      "Added desktop and mobile Playwright coverage for core routes, navigation, focus containment, contact submission, and structural accessibility.",
    proof: "18 browser checks plus a dedicated GitHub Actions workflow",
    href: "https://github.com/codesydney/bluehex/pull/29",
    pullRequest: 29,
    status: "Merged",
  },
  {
    repository: "Apache Maka",
    title: "Bounded MCP tool rediscovery",
    summary:
      "Prevented hostile list-change notifications from causing an infinite refresh loop while preserving the last callable tool snapshot.",
    proof: "Merged after adversarial review, regression probes, and upstream CI",
    href: "https://github.com/apache/maka/pull/2989",
    pullRequest: 2989,
    status: "Merged",
  },
  {
    repository: "FinVerify / Finverify",
    title: "Keyboard-accessible trust scores",
    summary:
      "Turned visual confidence indicators into named ARIA meters, added keyboard focus treatment, and replaced verification coverage with a semantic table.",
    proof: "0 critical axe violations across the audited workspace views",
    href: "https://github.com/FinVerify/Finverify/pull/70",
    pullRequest: 70,
    status: "In review",
  },
] as const;

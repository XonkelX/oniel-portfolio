import type { Project } from "@/types/project";

export const relay: Project = {
  slug: "relay",
  name: "Relay",
  category: "Distributed systems · Webhook delivery",
  summary:
    "A production webhook delivery platform with durable scheduling, signed requests, deterministic retries, operational evidence, and a public failure laboratory.",
  year: 2026,
  status: "Production v1.0",
  role: "System design, product design, and full-stack engineering",
  technologies: [
    "TypeScript",
    "React",
    "Cloudflare Workers",
    "D1",
    "Queues",
    "Hono",
  ],
  coverImage: "/projects/relay/relay-landing.png",
  mobileImage: "/projects/relay/relay-failure-lab.png",
  featured: true,
  evidence: [
    { label: "Release", value: "Production v1.0" },
    { label: "Quality", value: "304 release checks" },
    { label: "Focus", value: "Reliability + evidence" },
  ],
  highlights: [
    "Transactional outbox, durable retry scheduling, lease recovery, and at-least-once delivery",
    "Standard Webhooks-compatible signatures with encrypted endpoint secrets and stable message identity",
    "Inspectable attempt evidence, replay lineage, health telemetry, and seven controlled failure scenarios",
  ],
  links: [
    {
      label: "Open Failure Lab",
      href: "https://relay-console.sinmanos.workers.dev/failure-lab",
      kind: "live",
    },
    {
      label: "View source",
      href: "https://github.com/XonkelX/relay-webhook-delivery",
      kind: "source",
    },
    {
      label: "View v1.0 release",
      href: "https://github.com/XonkelX/relay-webhook-delivery/releases/tag/v1.0.0",
      kind: "release",
    },
    {
      label: "Watch demo",
      href: "https://github.com/XonkelX/relay-webhook-delivery/blob/main/docs/assets/relay-demo.webm",
      kind: "demo",
    },
  ],
} as const;

export const careerFlow: Project = {
  slug: "careerflow",
  name: "CareerFlow",
  category: "Full-stack product · Career management",
  summary:
    "A production-deployed career-management platform for organizing applications, deadlines, progress, and resume versions.",
  year: 2026,
  status: "Production v1.0",
  role: "Product design and full-stack engineering",
  technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Auth.js"],
  coverImage: "/projects/careerflow/careerflow-dashboard-desktop.png",
  mobileImage: "/projects/careerflow/careerflow-dashboard-mobile.png",
  featured: true,
  evidence: [
    { label: "Release", value: "Production v1.0" },
    { label: "Quality", value: "179 passing tests" },
    { label: "Focus", value: "Privacy-conscious workflows" },
  ],
  highlights: [
    "Server-enforced ownership for every application and resume operation",
    "Search, filters, deadlines, dashboard metrics, and resume versioning",
    "Responsive, keyboard-accessible workflows with documented release QA",
  ],
  links: [
    {
      label: "Open live product",
      href: "https://careerflow-snowy.vercel.app",
      kind: "live",
    },
    {
      label: "View source",
      href: "https://github.com/XonkelX/ai-career-tracker",
      kind: "source",
    },
    {
      label: "View v1.0 release",
      href: "https://github.com/XonkelX/ai-career-tracker/releases/tag/v1.0.0",
      kind: "release",
    },
    {
      label: "Watch complete demo",
      href: "https://github.com/XonkelX/ai-career-tracker/releases/download/v1.0.0/careerflow-v1-demo.mp4",
      kind: "demo",
    },
  ],
} as const;

export const nextQueue: Project = {
  slug: "next",
  name: "Next",
  category: "Real-time product · Queue management",
  summary:
    "A synchronized queue system for customers, staff, and public displays, with authorization and state transitions enforced in PostgreSQL.",
  year: 2026,
  status: "Production v1.0",
  role: "Product design and full-stack engineering",
  technologies: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Realtime"],
  coverImage: "/projects/next-queue/landing-page.png",
  mobileImage: "/projects/next-queue/mobile-view.png",
  featured: true,
  evidence: [
    { label: "Release", value: "Production v1.0" },
    { label: "Quality", value: "131 release checks" },
    { label: "Focus", value: "Realtime + authorization" },
  ],
  highlights: [
    "Customer, staff, and public-display views that converge without refresh",
    "Database-enforced RLS, idempotent commands, and transactional state changes",
    "131 checks across application, database, integration, browser, and production layers",
  ],
  links: [
    {
      label: "Open live product",
      href: "https://next-queue-omega.vercel.app",
      kind: "live",
    },
    {
      label: "View source",
      href: "https://github.com/XonkelX/next-queue",
      kind: "source",
    },
    {
      label: "Watch demo",
      href: "https://github.com/XonkelX/next-queue/blob/main/docs/assets/video/next-v1-demo.mp4",
      kind: "demo",
    },
  ],
} as const;

export const projects = [relay, nextQueue, careerFlow] as const;

export function getProjectLink(kind: Project["links"][number]["kind"]) {
  const link = careerFlow.links.find((item) => item.kind === kind);
  if (!link) throw new Error(`Missing CareerFlow ${kind} link`);
  return link;
}

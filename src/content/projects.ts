import type { Project } from "@/types/project";

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

export const projects = [careerFlow] as const;

export function getProjectLink(kind: Project["links"][number]["kind"]) {
  const link = careerFlow.links.find((item) => item.kind === kind);
  if (!link) throw new Error(`Missing CareerFlow ${kind} link`);
  return link;
}

export type ProjectLink = {
  label: string;
  href: string;
  kind: "live" | "source" | "release" | "demo";
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  year: number;
  status: string;
  role: string;
  technologies: readonly string[];
  coverImage: string;
  mobileImage: string;
  featured: boolean;
  evidence: readonly {
    label: string;
    value: string;
  }[];
  highlights: readonly string[];
  links: readonly ProjectLink[];
};

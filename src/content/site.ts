export const siteConfig = {
  name: "Oniel Alejo Feliz",
  title: "Software Engineer",
  location: "Tampa, Florida",
  email: "Onielbf10@gmail.com",
  siteUrl: "https://onielalejofeliz.space",
  githubUrl: "https://github.com/XonkelX",
  linkedinUrl: "https://www.linkedin.com/in/oniel-alejo-feliz-45b293312",
  resumeUrl: "/oniel-alejo-feliz-software-engineer-resume.pdf",
} as const;

export type Locale = "en" | "es";

export const navigation = [
  { label: "Work", href: "/#work" },
  { label: "AI Ads", href: "/#ads" },
  { label: "Open source", href: "/#open-source" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
] as const;

export const spanishNavigation = [
  { label: "Proyectos", href: "/es#proyectos" },
  { label: "Anuncios IA", href: "/es#anuncios" },
  { label: "Código abierto", href: "/es#codigo-abierto" },
  { label: "Servicios", href: "/es/servicios" },
  { label: "Sobre mí", href: "/es/about" },
] as const;

export function navigationFor(locale: Locale) {
  return locale === "es" ? spanishNavigation : navigation;
}

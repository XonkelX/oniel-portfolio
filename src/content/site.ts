export const siteConfig = {
  name: "Oniel Alejo Feliz",
  title: "Full-Stack Developer",
  location: "Tampa, Florida",
  email: "Onielbf10@gmail.com",
  siteUrl: "https://oniel-portfolio.vercel.app",
  githubUrl: "https://github.com/XonkelX",
  resumeUrl: "/oniel-alejo-feliz-full-stack-resume.pdf",
} as const;

export type Locale = "en" | "es";

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/#work" },
  { label: "Open source", href: "/#open-source" },
  { label: "Skills", href: "/#skills" },
  { label: "About", href: "/about" },
] as const;

export const spanishNavigation = [
  { label: "Inicio", href: "/es" },
  { label: "Proyectos", href: "/es#proyectos" },
  { label: "Código abierto", href: "/es#codigo-abierto" },
  { label: "Habilidades", href: "/es#habilidades" },
  { label: "Sobre mí", href: "/es/about" },
] as const;

export function navigationFor(locale: Locale) {
  return locale === "es" ? spanishNavigation : navigation;
}

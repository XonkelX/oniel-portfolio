export const siteConfig = {
  name: "Oniel Alejo Feliz",
  title: "Full-Stack Developer",
  location: "Tampa, Florida",
  email: "Onielbf10@gmail.com",
  siteUrl: "https://oniel-portfolio.vercel.app",
  githubUrl: "https://github.com/XonkelX",
  resumeUrl: null as string | null,
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
] as const;

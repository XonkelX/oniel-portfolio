import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { siteConfig } from "@/content/site";
import type { Locale } from "@/content/site";

export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const aboutHref = locale === "es" ? "/es/about" : "/about";
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <p>© 2026 Oniel Alejo Feliz</p>
        <div>
          <a href={siteConfig.resumeUrl} target="_blank" rel="noreferrer">
            {locale === "es" ? "Currículum" : "Résumé"}
          </a>
          <Link href={aboutHref}>{locale === "es" ? "Sobre mí" : "About"}</Link>
          <a href={`mailto:${siteConfig.email}`}>
            {locale === "es" ? "Correo" : "Email"}
          </a>
          <ExternalLink href={siteConfig.githubUrl} locale={locale}>
            GitHub
          </ExternalLink>
          <ExternalLink href={siteConfig.linkedinUrl} locale={locale}>
            LinkedIn
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}

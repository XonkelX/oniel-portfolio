import Link from "next/link";
import { siteConfig } from "@/content/site";
import { ExternalLink } from "@/components/external-link";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitch } from "@/components/language-switch";
import type { Locale } from "@/content/site";
import { navigationFor } from "@/content/site";

export function SiteHeader({ locale = "en" }: { locale?: Locale }) {
  const localizedNavigation = navigationFor(locale);
  const homeHref = locale === "es" ? "/es" : "/";
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link
          className="wordmark"
          href={homeHref}
          aria-label={
            locale === "es"
              ? "Oniel Alejo Feliz, página de inicio"
              : "Oniel Alejo Feliz, home"
          }
        >
          OA<span>F</span>
        </Link>
        <nav
          className="desktop-nav"
          aria-label={
            locale === "es" ? "Navegación principal" : "Primary navigation"
          }
        >
          {localizedNavigation.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
          <ExternalLink href={siteConfig.githubUrl} locale={locale}>
            GitHub
          </ExternalLink>
        </nav>
        <div className="site-header__actions">
          <a
            className="header-cta"
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            {locale === "es" ? "Currículum" : "Résumé"}
          </a>
          <LanguageSwitch locale={locale} />
          <ThemeToggle locale={locale} />
          <MobileNavigation locale={locale} />
        </div>
      </div>
    </header>
  );
}

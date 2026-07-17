import Link from "next/link";
import { navigation, siteConfig } from "@/content/site";
import { ExternalLink } from "@/components/external-link";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link
          className="wordmark"
          href="/"
          aria-label="Oniel Alejo Feliz, home"
        >
          OA<span>F</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
          <ExternalLink href={siteConfig.githubUrl}>GitHub</ExternalLink>
        </nav>
        <div className="site-header__actions">
          <ThemeToggle />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <p>© 2026 Oniel Alejo Feliz</p>
        <div>
          <Link href="/about">About</Link>
          <a href={`mailto:${siteConfig.email}`}>Email</a>
          <ExternalLink href={siteConfig.githubUrl}>GitHub</ExternalLink>
        </div>
      </div>
    </footer>
  );
}

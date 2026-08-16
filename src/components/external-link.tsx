import type { AnchorHTMLAttributes, ReactNode } from "react";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  locale?: "en" | "es";
};

export function ExternalLink({
  children,
  locale = "en",
  ...props
}: ExternalLinkProps) {
  return (
    <a target="_blank" rel="noreferrer" {...props}>
      {children}
      <span className="external-mark" aria-hidden="true">
        ↗
      </span>
      <span className="sr-only">
        {locale === "es"
          ? " (se abre en una pestaña nueva)"
          : " (opens in a new tab)"}
      </span>
    </a>
  );
}

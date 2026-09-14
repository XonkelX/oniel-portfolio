"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content/site";

function pathForLocale(pathname: string, locale: Locale) {
  if (locale === "es") {
    if (pathname === "/services") return "/es/servicios";
    return pathname === "/" ? "/es" : `/es${pathname}`;
  }
  if (pathname === "/es/servicios") return "/services";
  const englishPath = pathname.replace(/^\/es(?=\/|$)/, "");
  return englishPath || "/";
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const targetLocale = locale === "es" ? "en" : "es";
  const label = locale === "es" ? "View in English" : "Ver en español";

  return (
    <Link
      className="language-switch"
      href={pathForLocale(pathname, targetLocale)}
      hrefLang={targetLocale}
      lang={targetLocale}
      aria-label={label}
    >
      {targetLocale.toUpperCase()}
    </Link>
  );
}

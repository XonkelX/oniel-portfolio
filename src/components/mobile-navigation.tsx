"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigationFor, siteConfig, type Locale } from "@/content/site";

export function MobileNavigation({ locale = "en" }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const localizedNavigation = navigationFor(locale);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("a, button"),
      );
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        ref={triggerRef}
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        {locale === "es" ? "Menú" : "Menu"}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="mobile-nav__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              ref={panelRef}
              id="mobile-menu"
              className="mobile-nav__panel"
              role="dialog"
              aria-modal="true"
              aria-label={
                locale === "es" ? "Navegación del sitio" : "Site navigation"
              }
              initial={reduceMotion ? false : { x: 28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { x: 28, opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="mobile-nav__topline">
                <span>{locale === "es" ? "Navegar" : "Navigate"}</span>
                <button type="button" onClick={() => setOpen(false)}>
                  {locale === "es" ? "Cerrar" : "Close"}
                </button>
              </div>
              <nav
                aria-label={
                  locale === "es" ? "Navegación móvil" : "Mobile navigation"
                }
              >
                {localizedNavigation.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={
                      (item.href === "/" && pathname === "/") ||
                      item.href === pathname
                        ? "page"
                        : undefined
                    }
                    onClick={() => setOpen(false)}
                  >
                    <span>0{index + 1}</span>
                    {item.label}
                  </Link>
                ))}
                <a
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span>0{localizedNavigation.length + 1}</span>
                  {locale === "es" ? "Currículum" : "Résumé"} ↗
                </a>
                <a
                  href={siteConfig.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span>0{localizedNavigation.length + 2}</span>GitHub ↗
                </a>
              </nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

"use client";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({ locale = "en" }: { locale?: "en" | "es" }) {
  function toggleTheme() {
    const next = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("theme", next);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={
        locale === "es"
          ? "Cambiar entre tema claro y oscuro"
          : "Toggle between light and dark theme"
      }
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb" />
      </span>
      <span className="theme-label theme-label--light" aria-hidden="true">
        {locale === "es" ? "Claro" : "Light"}
      </span>
      <span className="theme-label theme-label--dark" aria-hidden="true">
        {locale === "es" ? "Oscuro" : "Dark"}
      </span>
    </button>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found container">
      <p className="eyebrow">404 / Not found</p>
      <h1>This page left the workflow.</h1>
      <p>The address may be outdated, or the page may never have existed.</p>
      <Link className="button button--primary" href="/">
        Return home <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}

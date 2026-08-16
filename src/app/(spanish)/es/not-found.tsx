import Link from "next/link";

export default function SpanishNotFound() {
  return (
    <main id="main-content" className="not-found container">
      <p className="eyebrow">404 / No encontrado</p>
      <h1>Esta página salió del flujo.</h1>
      <p>La dirección puede estar desactualizada o la página nunca existió.</p>
      <Link className="button button--primary" href="/es">
        Volver al inicio <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}

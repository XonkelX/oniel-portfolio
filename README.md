# Oniel Alejo Feliz — Developer Portfolio

A minimalist, typography-led portfolio for full-stack developer [Oniel Alejo Feliz](https://github.com/XonkelX). It presents three production systems through evidence-backed product and engineering case studies.

[Live portfolio](https://oniel-portfolio.vercel.app) · [Relay demo](https://relay-console.sinmanos.workers.dev/) · [Relay v1.0](https://github.com/XonkelX/relay-webhook-delivery/releases/tag/v1.0.0) · [Next](https://next-queue-omega.vercel.app) · [CareerFlow](https://careerflow-snowy.vercel.app)

## Overview

The portfolio presents Oniel as a product-minded full-stack developer who combines dependable engineering with accessible interface design. It remains intentionally focused: static presentation routes, three featured production projects, no content management system, and no backend.

## Featured projects

Relay leads the portfolio with distributed webhook delivery, durable retries, signed requests, operational evidence, and a controlled public Failure Lab. Next demonstrates realtime multi-client coordination and database-enforced authorization. CareerFlow demonstrates account-scoped product workflows, relational modeling, and release-quality application engineering.

![Portfolio homepage featuring CareerFlow](docs/assets/screenshots/portfolio-home-desktop.png)

## Technology stack

- Next.js 16 App Router and React 19
- Strict TypeScript
- Tailwind CSS 4 with a small semantic token layer
- Motion for React for focused interaction transitions
- Next.js Image and generated metadata images
- Vitest and Testing Library
- Playwright and axe-core
- ESLint and Prettier

All routes are statically rendered. Client code is limited to theme selection, mobile navigation, and subtle product-media motion.

## Design direction

The visual system uses warm off-white and charcoal surfaces, a single restrained blue accent, locally bundled Geist and Geist Mono fonts, precise rules, deliberate asymmetry, and generous negative space. Product imagery follows an editorial rhythm instead of a repeated card grid.

Semantic CSS variables power both themes. The first visit follows the operating-system preference; an explicit light or dark selection is stored locally and resolved before paint to avoid an obvious flash.

## Motion and accessibility

Motion supports entrance hierarchy, menu state, project-media depth, hover feedback, and section reveals. Critical content is present in the initial HTML. Under `prefers-reduced-motion`, delays, movement, smooth scrolling, and nonessential transitions collapse to effectively instant feedback.

Accessibility work includes semantic landmarks, one clear page heading, a skip link, visible focus, keyboard navigation, an Escape-dismissible focus-managed mobile dialog, safe external-link names, descriptive image alternatives, video controls and an adjacent text equivalent, sufficient tap targets, responsive reflow, and automated axe checks.

## Local development

Requirements: Node.js 22.x and npm 10.9 or newer. The committed lockfile was generated with npm 11.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev           # local development
npm run build         # optimized production build
npm run start         # serve the production build
npm run format        # write formatting
npm run format:check  # verify formatting
npm run lint          # ESLint with zero warnings
npm run typecheck     # strict TypeScript check
npm run test          # unit and component tests
npm run test:watch    # interactive Vitest mode
npm run test:e2e      # Playwright browser suite
```

Install the Playwright Chromium browser once before the browser suite:

```bash
npx playwright install chromium
```

## Project structure

```text
src/
├── app/                     # Routes, metadata, sitemap, robots, generated images
├── components/              # Focused layout and interaction components
├── content/                 # Typed site and project configuration
└── types/                   # Project content contracts
public/projects/             # Intentional public media for Relay, Next, and CareerFlow
tests/
├── e2e/                     # Browser and accessibility smoke coverage
└── *.test.*                 # Content, component, and motion checks
docs/assets/screenshots/     # Finished portfolio presentation captures
```

## Deployment and cost model

The site is designed for Vercel Hobby with no environment variables, database, storage, forms, paid fonts, or paid platform features. The canonical URL is held in the typed site configuration and used by page metadata, the sitemap, and robots output.

The portfolio costs $0 to operate within Vercel Hobby quotas. Featured products remain separate applications and repositories; this portfolio includes only their intentionally public presentation assets.

## Privacy

The portfolio has no backend and no database. It collects no visitor information, sends no contact submissions, uses no analytics or tracking, and creates no cookies. The only browser storage is the visitor’s local theme preference. Contact uses a normal `mailto:` link.

## Adding future projects

Add a typed entry in `src/content/projects.ts`, copy only intentional public media into a project-specific folder under `public/projects`, then create a dedicated case-study route when the project has enough verified material. The homepage component can consume the shared metadata without a CMS.

## Author

Built by [Oniel Alejo Feliz](mailto:Onielbf10@gmail.com), a full-stack developer based in Tampa, Florida.

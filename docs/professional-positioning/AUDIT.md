# Professional Positioning Audit

Audit date: 2026-09-14

This note records the verified pre-edit state of Oniel Alejo Feliz's public professional materials. GitHub API data, upstream pull-request records, owned repository metadata, local source files, public portfolio pages, résumé extraction, and the connected Contra profile were checked before copy or structure changed.

## Verified source of truth

- Identity: Oniel Alejo Feliz, Tampa, Florida; English and Spanish; U.S. permanent resident; no employer sponsorship required.
- Employment direction: Software Engineer focused on TypeScript, Node.js, React and Next.js, PostgreSQL, APIs, reliability, testing, and existing-codebase work.
- Contract direction: TypeScript SaaS Maintenance and Reliability for existing Next.js, React, Node.js, Supabase, and PostgreSQL applications.
- Public original work with current evidence: Relay, Next, CareerFlow, SinManos, Cofre, and the developer portfolio. Numeric product totals should not be used as a headline because the definition and count change as releases are added.
- Upstream pull requests authored by `XonkelX`: six merged and two open.
  - Merged: Reticle #278, Code.Sydney BlueHex #29, Apache Maka #2989, Clarvia #269, Apache Fineract Backoffice UI #431, and Apache Fineract Backoffice UI #475.
  - Open: FinVerify #70 and Agenta #6224.
- Current releases verified through the GitHub API: Relay v1.0.0, Next v1.0.0, CareerFlow v1.0.0, and Cofre v0.1.0.
- Canonical CareerFlow repository URL: `https://github.com/XonkelX/CareerFlow`. The old `XonkelX/ai-career-tracker` URL redirects, but should not remain the authored canonical link.

## Strongest external evidence

1. Reticle #278 persisted learned routes across crawls and ordinary navigation. The change added bounded and batched persistence plus regression coverage across ten files. The maintainer called it the strongest pull request in the queue, requested two growth-related corrections, confirmed both were addressed, and merged it after upstream validation. The final GitHub check rollup records successful `verify`, Windows, macOS, E2E, desktop-E2E, install-gate, and aggregate gate jobs; public-facing copy uses the shorter formulation to avoid a brittle list.
2. Apache Maka #2989 bounded repeated MCP tool rediscovery. Maintainer review found multiple edge cases in the first implementations. The final revision covered slow hostile notification timing, snapshot preservation, and disconnect behavior; maintainers confirmed the blockers were resolved before merge and CI passed.
3. Code.Sydney BlueHex #29 added production-build Playwright coverage for routes, responsive navigation, focus behavior, contact submission, and structural accessibility. The maintainer requested action-SHA updates and stronger assertions, then approved the revised contribution after both build and Playwright checks passed.
4. Clarvia #269 fixed keyboard and screen-reader barriers in checklist, navigation, cookie, and preview interactions. A maintainer approved the contribution as a thorough accessibility improvement. Repository validation and CodeQL passed; SonarCloud reported a separate failed check, so the materials must not claim that every individual check was green.
5. Apache Fineract Backoffice UI #475 changed fifteen files in total, but only thirteen were client-area specifications. It migrated the remaining 13 client-area Jasmine/Karma specs, covering 73 targeted tests, to Vitest. Maintainer approval preceded merge; unit, build, formatting, security, CodeQL, and browser checks passed.

Apache Fineract #431 is also merged and useful evidence of a small, focused existing-codebase fix, but it is lower-signal than the five contributions above. FinVerify #70 and Agenta #6224 remain open and must be labeled as such.

## Inconsistencies and positioning problems

### GitHub profile

- The README identifies Oniel as a full-stack developer who turns ideas into complete applications. This leads with new-product breadth instead of safe contribution to existing systems.
- The profile metric says four merged upstream pull requests; GitHub verifies six.
- The open-source introduction also says four merged pull requests and one active review, while two pull requests are open.
- Apache Fineract contributions are absent even though both have merged.
- The toolkit is dominated by decorative badges and the animated statistics graphic appears before the strongest third-party validation.
- Contract maintenance and reliability work is not offered directly.
- Pinned repositories currently begin with CareerFlow, followed by Next and Relay. The evidence-backed order should lead with Relay and Next, then keep original work visible while using the README to surface upstream repositories that cannot reliably be pinned.
- Owned repository descriptions and topics repeatedly use `portfolio`, `full-stack`, and `deployed ... portfolio project` wording. This reinforces the old identity.

### Portfolio source and deployment

- The English homepage metric says three merged upstream pull requests; the same page later says five merged. The verified total is six.
- The Spanish homepage still lacks the updated contribution count and uses the broad `Full stack` identity.
- The hero leads with `Full-Stack Developer`, `I build software`, and deployed products. It does not distinguish the employment path from the contract-maintenance path.
- The project order is SinManos, Relay, Next, CareerFlow, Cofre. This prioritizes visual/product breadth over reliability and authorization evidence. Relay and Next should lead.
- Open-source evidence appears after all five projects. It should move higher because it proves work in unfamiliar codebases.
- There is no services route, scoped-issue CTA, maintenance workflow, AI-built application stabilization offer, or proof-to-service mapping.
- Metadata, Open Graph copy, structured data, and the generated social image all use the old full-stack/product-builder framing.
- Sitemap dates are manually stale and there are no English or Spanish service routes.
- The public résumé filename and link use `full-stack-resume`, tying the canonical document to the old positioning.
- The live responsive layouts are visually sound at 390x844, 768x1024, and 1440x1000, with no browser-console warnings in the audit session. The design should be preserved.

### Résumé

- The canonical public résumé says `FULL-STACK DEVELOPER`, leads with four portfolio products, and states three merged upstream contributions.
- Open-source work has only two bullets and omits Clarvia plus both Apache Fineract merges.
- Relay, Next, and CareerFlow receive more page space than externally reviewed engineering.
- Contact labels are hyperlinks, but the extracted text does not expose full plaintext portfolio, GitHub, and LinkedIn URLs.
- Separate backend, frontend, and full-stack variants duplicate the same stale counts and create multiple sources of truth.
- The public portfolio PDF and the local résumé PDF are different files even though their extracted copy is substantially the same, creating avoidable update drift.

### LinkedIn source copy and access

- The prepared LinkedIn headline identifies Oniel as a Full-Stack Developer and hard-codes three merged contributions.
- About and Experience repeat the same stale count and omit Clarvia and Apache Fineract evidence.
- The About section is a large project and technology list, with no concise maintenance specialty.
- The connected browser reaches LinkedIn's authentication wall rather than an authenticated profile editor. Exact replacement content can be prepared, but the account cannot be modified without a user sign-in handoff.

### Contra

- The connected profile is only 11 percent complete.
- Current headline: `Full-stack engineer building reliable, AI-assisted products.` This makes AI tooling part of the identity and does not state the client problem.
- Work, Services, biography, hourly rate, timezone, languages, and social links are empty.
- No evidence connects a prospective client's auth, data, API, deployment, or regression problem to Oniel's public engineering work.

## Canonical repair rules

- Employment first: `Software Engineer - TypeScript · Node.js · React/Next.js · PostgreSQL`.
- Contract specialty: `TypeScript SaaS Maintenance and Reliability`.
- Core value proposition: diagnose the root cause in an existing codebase, make the smallest safe fix, add regression coverage when appropriate, deliver a clean pull request, and explain the result.
- Prefer direct links to reviewed pull requests and stable qualitative language over manually maintained contribution counters.
- Keep open contributions labeled `Open` or `In review`; never blend them into merged totals.
- Describe Apache, Reticle, Clarvia, BlueHex, Agenta, and FinVerify work as independent open-source contribution, never employment.
- Keep AI-built application rescue focused on independent code review and verification, without criticizing AI tools or presenting AI as Oniel's primary professional identity.
- Preserve existing visual quality, accessibility, bilingual parity, and working case-study routes.

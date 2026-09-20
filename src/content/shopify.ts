const repository = "https://github.com/XonkelX/shopify-commerce-lab";
const evidence = `${repository}/blob/main/docs/shopify`;
const source = `${repository}/blob/main`;

export type ShopifyEvidence = {
  title: string;
  problem: string;
  proof: string;
  technologies: string;
  image: string;
  imageAlt: string;
  caseStudy: string;
  source: string;
  preview?: string;
};

export const shopifyEvidence: ShopifyEvidence[] = [
  {
    title: "Advanced product page",
    problem:
      "Variant changes can leave price, imagery, availability, and cart state out of sync.",
    proof:
      "A real six-variant Shopify product keeps those states aligned and renders metafield and metaobject content.",
    technologies: "Liquid · JavaScript · variants · metafields",
    image: "/projects/shopify/phase-2-variant-interaction.png",
    imageAlt:
      "Atlas bottle product page showing the selected Navy and 32 oz variant",
    caseStudy: `${evidence}/advanced-pdp.md`,
    source: `${source}/theme/sections/product.liquid`,
    preview:
      "https://oniel-lab.myshopify.com/products/atlas-insulated-bottle?preview_theme_id=155175092398",
  },
  {
    title: "Custom Shopify section",
    problem:
      "Merchants need to update comparison content without developer edits.",
    proof:
      "A reusable product-comparison section exposes its content, blocks, and layout in the Theme Editor.",
    technologies: "Liquid · Online Store 2.0 · section schema",
    image: "/projects/shopify/custom-section.png",
    imageAlt: "Three-card Shopify product comparison section",
    caseStudy: `${evidence}/custom-section.md`,
    source: `${source}/theme/sections/product-comparison.liquid`,
    preview: "https://oniel-lab.myshopify.com/?preview_theme_id=155175092398",
  },
  {
    title: "Product configurator",
    problem:
      "Personalized choices need validation and must survive the Shopify cart.",
    proof:
      "Engraving, style, gift note, and gift wrap follow a real variant into visible line-item properties.",
    technologies: "Liquid · variants · line-item properties",
    image: "/projects/shopify/product-configurator.png",
    imageAlt:
      "Personalized bottle configurator showing engraving and gift options",
    caseStudy: `${evidence}/product-configurator.md`,
    source: `${source}/theme/sections/product-configurator.liquid`,
    preview:
      "https://oniel-lab.myshopify.com/products/atlas-personalized-bottle?preview_theme_id=155175092398&view=personalized",
  },
  {
    title: "Cart and purchase logic",
    problem:
      "Case-based purchasing needs predictable rounding and an accurate cart quantity.",
    proof:
      "A quantity calculator converts demand into whole cases; the AJAX drawer refreshes from Shopify cart data.",
    technologies: "Liquid · JavaScript · Ajax Cart API",
    image: "/projects/shopify/cart-purchase-logic.png",
    imageAlt: "Shopify case calculator displaying whole-case purchase math",
    caseStudy: `${evidence}/cart-purchase-logic.md`,
    source: `${source}/theme/sections/purchase-logic-calculator.liquid`,
    preview:
      "https://oniel-lab.myshopify.com/products/atlas-insulated-bottle?preview_theme_id=155175092398&view=case-calculator",
  },
  {
    title: "Theme debugging",
    problem: "Inherited theme bugs can make cart state misleading or unusable.",
    proof:
      "Three source-backed repairs cover stale cart count, missing variant identity, and an invalid empty-cart state.",
    technologies: "Liquid · JavaScript · cart sections",
    image: "/projects/shopify/phase-3-after-variant-cart.png",
    imageAlt: "Repaired Shopify cart showing variant details and personalization properties",
    caseStudy: `${evidence}/bug-fix-lab.md`,
    source: `${source}/theme/sections/cart.liquid`,
  },
  {
    title: "Performance and QA",
    problem:
      "A working theme still needs repeatable quality checks and documented limits.",
    proof:
      "Theme Check, nine Lighthouse runs, keyboard and responsive checks, and push/PR quality gates are recorded.",
    technologies: "Theme Check · Lighthouse · accessibility · CI",
    image: "/projects/shopify/performance-qa.png",
    imageAlt: "Shopify storefront collection used in the quality verification",
    caseStudy: `${evidence}/performance-qa.md`,
    source: `${source}/.github/workflows/quality.yml`,
  },
  {
    title: "Inventory sync integration",
    problem:
      "Inventory mismatches and failed syncs need visible, recoverable handling.",
    proof:
      "An embedded app uses real Admin GraphQL and webhooks with PostgreSQL-backed retries, idempotency, and a merchant dashboard.",
    technologies: "React Router · Admin GraphQL · webhooks · Prisma",
    image: "/projects/shopify/inventory-sync-dashboard.png",
    imageAlt: "Inventory Sync Monitor dashboard inside Shopify admin",
    caseStudy: `${source}/docs/case-studies/inventory-sync-monitor.md`,
    source: `${source}/inventory-sync-monitor/app/services/inventory-sync.server.ts`,
  },
];

export const shopifyRepository = repository;

import type { Locale } from "@/content/site";

export type WorkItem = {
  slug: "ciento" | "relay" | "next" | "careerflow";
  name: string;
  tagline: string;
  stack: string;
  image: string;
};

export type AdSample = {
  id: "hibika" | "nuvare" | "teobra";
  brand: string;
  detail: string;
  label: string;
};

/** Merged pull requests in external public repositories, verified on GitHub on 2026-11-16. */
export const mergedPullRequestCount = 12;

export const mergedRepositories = [
  { name: "Apache Maka", href: "https://github.com/apache/maka/pull/2989" },
  {
    name: "Apache Fineract",
    href: "https://github.com/apache/fineract-backoffice-ui/pull/475",
  },
  { name: "Reticle", href: "https://github.com/reticlehq/reticle/pull/278" },
  {
    name: "Clarvia",
    href: "https://github.com/clarvia-org/clarvia-graph/pull/269",
  },
  { name: "BlueHex", href: "https://github.com/codesydney/bluehex/pull/29" },
  { name: "Agenta", href: "https://github.com/Agenta-AI/agenta/pull/6224" },
  {
    name: "OWASP CVE Lite",
    href: "https://github.com/OWASP/cve-lite-cli/pull/1204",
  },
  {
    name: "HybridOps",
    href: "https://github.com/hybridops-tech/hybridops-core/pull/389",
  },
  { name: "Sotto", href: "https://github.com/getsotto/sotto/pull/293" },
  { name: "edaprep", href: "https://github.com/bijay-odyssey/edaprep/pull/58" },
  {
    name: "VS Code Agent Bell",
    href: "https://github.com/chahe-dridi/vscode-agent-bell/pull/166",
  },
] as const;

const workImages = {
  ciento: "/projects/ciento/ciento-home.png",
  relay: "/projects/relay/relay-failure-lab.png",
  next: "/projects/next-queue/landing-page.png",
  careerflow: "/projects/careerflow/careerflow-dashboard-desktop.png",
} as const;

const copy = {
  en: {
    homeLabel: "Oniel Alejo Feliz",
    meta: [
      { label: "Work", value: "Web products + AI ads" },
      { label: "Base", value: "Tampa, Florida · remote" },
      { label: "Languages", value: "English y español" },
      { label: "Status", value: "Open to roles and projects", live: true },
    ],
    floatCaption: "Now building · Ciento",
    floatAlt: "Ciento membership platform home page",
    ads: {
      id: "ads",
      eyebrow: "AI ads for businesses",
      titleTop: "Ads that stop",
      titleBottom: "the scroll.",
      intro:
        "Short vertical ads for your product, from one photo to a finished spot with motion, type and sound.",
      chips: ["Reels", "TikTok", "Shorts", "EN / ES"],
      soundOn: "Sound on",
      soundOff: "Sound off",
      soundLabel: "Toggle sound for the",
      spec: "Sample ads · brands created for this portfolio",
      steps: [
        {
          title: "Your product photo",
          text: "Plus what you sell and who buys it.",
        },
        {
          title: "Script and shot list",
          text: "A hook in the first second, three scenes, one message.",
        },
        {
          title: "Generated scenes",
          text: "Each shot built from your real product.",
        },
        {
          title: "Edit, type and sound",
          text: "Logo, offer and music, ready to post.",
        },
      ],
      cta: "Get an ad for your business",
      ctaSubject: "An ad for my business",
      ctaNote: "English or Spanish · 9:16 for Reels, TikTok and Shorts",
      samples: [
        {
          id: "hibika",
          brand: "Hibika",
          detail: "Sparkling drink · 15s",
          label: "Hibika sparkling hibiscus water ad",
        },
        {
          id: "nuvare",
          brand: "Nuvare",
          detail: "Perfume · 19s",
          label: "Nuvare perfume ad",
        },
        {
          id: "teobra",
          brand: "Teobra",
          detail: "Dark chocolate · 15s",
          label: "Teobra dark chocolate ad",
        },
      ],
    },
    work: {
      id: "work",
      title: "Selected work",
      year: "2026",
      caseLabel: "case study",
      items: [
        {
          slug: "ciento",
          name: "Ciento",
          tagline: "Membership platform for businesses and members",
          stack: "Next.js · FastAPI",
          image: workImages.ciento,
        },
        {
          slug: "relay",
          name: "Relay",
          tagline: "Webhooks that survive failures",
          stack: "Cloudflare Workers · Queues",
          image: workImages.relay,
        },
        {
          slug: "next",
          name: "Next",
          tagline: "Live queues for staff, customers and screens",
          stack: "Next.js · Supabase Realtime",
          image: workImages.next,
        },
        {
          slug: "careerflow",
          name: "CareerFlow",
          tagline: "Applications, deadlines and resumes in one place",
          stack: "Next.js · Prisma",
          image: workImages.careerflow,
        },
      ],
      more: "Shopify work",
    },
    openSource: {
      id: "open-source",
      title: "pull requests merged in other people's codebases.",
      more: "See my GitHub",
    },
    contact: {
      titleTop: "¿Hablamos?",
      titleBottom: "Let's talk.",
      email: "Email me",
      resume: "Résumé",
    },
  },
  es: {
    homeLabel: "Oniel Alejo Feliz",
    meta: [
      { label: "Hago", value: "Productos web + anuncios con IA" },
      { label: "Base", value: "Tampa, Florida · remoto" },
      { label: "Idiomas", value: "Español y English" },
      {
        label: "Estado",
        value: "Disponible para roles y proyectos",
        live: true,
      },
    ],
    floatCaption: "Ahora construyendo · Ciento",
    floatAlt: "Página de inicio de la plataforma de membresías Ciento",
    ads: {
      id: "anuncios",
      eyebrow: "Anuncios con IA para negocios",
      titleTop: "Anuncios que frenan",
      titleBottom: "el scroll.",
      intro:
        "Anuncios verticales cortos para tu producto: de una foto a un spot terminado, con movimiento, textos y sonido.",
      chips: ["Reels", "TikTok", "Shorts", "ES / EN"],
      soundOn: "Con sonido",
      soundOff: "Sin sonido",
      soundLabel: "Activar o quitar el sonido del",
      spec: "Anuncios de muestra · marcas creadas para este portafolio",
      steps: [
        {
          title: "Tu foto del producto",
          text: "Y qué vendes y a quién.",
        },
        {
          title: "Guion y planos",
          text: "Un gancho en el primer segundo, tres escenas, un mensaje.",
        },
        {
          title: "Escenas generadas",
          text: "Cada plano parte de tu producto real.",
        },
        {
          title: "Montaje, textos y sonido",
          text: "Logo, oferta y música, listo para publicar.",
        },
      ],
      cta: "Quiero un anuncio para mi negocio",
      ctaSubject: "Un anuncio para mi negocio",
      ctaNote: "En español o inglés · 9:16 para Reels, TikTok y Shorts",
      samples: [
        {
          id: "hibika",
          brand: "Hibika",
          detail: "Bebida con gas · 15 s",
          label: "Anuncio de Hibika, agua con gas de jamaica",
        },
        {
          id: "nuvare",
          brand: "Nuvare",
          detail: "Perfume · 19 s",
          label: "Anuncio del perfume Nuvare",
        },
        {
          id: "teobra",
          brand: "Teobra",
          detail: "Chocolate negro · 15 s",
          label: "Anuncio del chocolate negro Teobra",
        },
      ],
    },
    work: {
      id: "proyectos",
      title: "Proyectos",
      year: "2026",
      caseLabel: "caso de estudio",
      items: [
        {
          slug: "ciento",
          name: "Ciento",
          tagline: "Plataforma de membresías para negocios y miembros",
          stack: "Next.js · FastAPI",
          image: workImages.ciento,
        },
        {
          slug: "relay",
          name: "Relay",
          tagline: "Webhooks que sobreviven a los fallos",
          stack: "Cloudflare Workers · Queues",
          image: workImages.relay,
        },
        {
          slug: "next",
          name: "Next",
          tagline: "Colas en vivo para personal, clientes y pantallas",
          stack: "Next.js · Supabase Realtime",
          image: workImages.next,
        },
        {
          slug: "careerflow",
          name: "CareerFlow",
          tagline:
            "Postulaciones, fechas límite y currículums en un solo lugar",
          stack: "Next.js · Prisma",
          image: workImages.careerflow,
        },
      ],
      more: "Trabajo con Shopify",
    },
    openSource: {
      id: "codigo-abierto",
      title: "pull requests aceptados en código de otros equipos.",
      more: "Ver mi GitHub",
    },
    contact: {
      titleTop: "¿Hablamos?",
      titleBottom: "Let's talk.",
      email: "Escríbeme",
      resume: "Currículum",
    },
  },
} as const;

export function homeCopy(locale: Locale) {
  return copy[locale];
}

export type SpanishCaseStudySlug = "sinmanos" | "relay" | "next" | "careerflow";

export type SpanishCaseStudy = {
  slug: SpanishCaseStudySlug;
  seoTitle: string;
  seoDescription: string;
  version: string;
  summary: string;
  meta: readonly (readonly [string, string])[];
  cover: {
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
  };
  sections: readonly {
    eyebrow: string;
    title: string;
    lede?: string;
    paragraphs?: readonly string[];
    steps?: readonly string[];
    decisions?: readonly { title: string; copy: string }[];
    quality?: readonly (readonly [string, string])[];
    media?: readonly {
      src: string;
      alt: string;
      caption: string;
      width: number;
      height: number;
      mobile?: boolean;
    }[];
  }[];
  next: { slug: SpanishCaseStudySlug | null; label: string };
};

export const spanishCaseStudies: readonly SpanishCaseStudy[] = [
  {
    slug: "sinmanos",
    seoTitle: "Caso de estudio de SinManos",
    seoDescription:
      "Diseño de producto, integración con Riot API, analítica de campeones y sistema visual original detrás de SinManos.",
    version: "Beta pública / 2026",
    summary:
      "Un compañero de League of Legends enfocado en jugadores de LAN, diseñado para consultar tier lists, guías de campeones e historial de partidas con rapidez y una identidad propia.",
    meta: [
      ["Rol", "Diseño de producto + ingeniería full-stack"],
      ["Stack", "React · TypeScript · Cloudflare Workers"],
      ["Datos", "Riot API · Data Dragon · LAN"],
    ],
    cover: {
      src: "/projects/sinmanos/home.png",
      alt: "Página inicial de SinManos con accesos a Solo Q, Tier List y ARAM",
      caption: "SinManos · Tres rutas claras hacia el producto",
      width: 1600,
      height: 1000,
    },
    sections: [
      {
        eyebrow: "El objetivo",
        title:
          "Convertir un producto conocido de estadísticas en una experiencia propia para LAN.",
        lede: "El reto no era copiar una gran plataforma de analítica, sino comprender su estructura útil y reconstruirla como un producto más pequeño, original y enfocado.",
        paragraphs: [
          "SinManos reúne descubrimiento de campeones, orientación de builds y búsqueda de jugadores. Su sistema visual usa texturas de brocha, máscaras asimétricas y contraste tipográfico para que los datos densos se sientan enérgicos sin dificultar la navegación.",
        ],
      },
      {
        eyebrow: "Experiencia del producto",
        title: "De patrones generales a un campeón o jugador específico.",
        media: [
          {
            src: "/projects/sinmanos/ranked.png",
            alt: "Tier list clasificatoria de SinManos con líderes por rol y filtros",
            caption:
              "Clasificatoria · Líderes por rol, filtros y contexto de tier list",
            width: 1600,
            height: 1000,
          },
          {
            src: "/projects/sinmanos/champion.png",
            alt: "Guía de Ekko con build, runas y counters en SinManos",
            caption:
              "Campeón · Build, runas, counters y progresión de habilidades",
            width: 1600,
            height: 1000,
          },
          {
            src: "/projects/sinmanos/player.png",
            alt: "Búsqueda de jugador por Riot ID para LAN en SinManos",
            caption: "Jugador · Flujo de búsqueda enfocado en LAN",
            width: 1600,
            height: 1000,
          },
        ],
      },
      {
        eyebrow: "Arquitectura",
        title: "Recursos públicos del juego y solicitudes en vivo protegidas.",
        paragraphs: [
          "El cliente React se despliega como una aplicación estática rápida. Un Cloudflare Worker administra el acceso a Riot API, valida las solicitudes y mantiene la clave fuera del navegador. Data Dragon aporta campeones, objetos, hechizos, runas e imágenes.",
        ],
        decisions: [
          {
            title: "Alcance primero para LAN",
            copy: "El producto se concentra en Latin America North y prioriza Solo/Duo, ARAM, campeones y búsqueda por Riot ID.",
          },
          {
            title: "Acceso a Riot desde el servidor",
            copy: "Las credenciales permanecen en el Worker; el navegador recibe únicamente la respuesta que necesita.",
          },
          {
            title: "Datos estáticos y en vivo separados",
            copy: "Data Dragon entrega recursos estables y Riot API atiende las consultas de jugadores, reduciendo llamadas innecesarias.",
          },
          {
            title: "Lenguaje visual reconocible",
            copy: "Brochas secas, siluetas marcadas, tipografía grande y una paleta limitada crean una identidad propia.",
          },
        ],
      },
      {
        eyebrow: "Alcance actual",
        title: "Un producto pequeño con límites de datos honestos.",
        paragraphs: [
          "La búsqueda de jugadores y el historial usan datos de Riot. Las superficies de campeones pueden presentarse como vistas curadas mientras se completa el acceso de agregación; la interfaz comunica esa diferencia en lugar de presentar ejemplos como datos en vivo.",
        ],
      },
    ],
    next: { slug: "relay", label: "Explorar Relay" },
  },
  {
    slug: "relay",
    seoTitle: "Caso de estudio de Relay",
    seoDescription:
      "Arquitectura distribuida, manejo de fallos, seguridad, evidencia operativa y validación de producción detrás de Relay v1.0.",
    version: "2026 / v1.0",
    summary:
      "Una plataforma de entrega de webhooks que convierte reintentos, fallos del receptor, firmas y recuperación en un ciclo durable que los operadores pueden inspeccionar.",
    meta: [
      ["Rol", "Diseño de sistemas + ingeniería full-stack"],
      ["Plataforma", "Cloudflare Workers"],
      ["Topología", "Workers · D1 · Queues · Cron"],
      ["Repositorio", "Público"],
    ],
    cover: {
      src: "/projects/relay/relay-landing.png",
      alt: "Página de Relay que presenta infraestructura de webhooks inspeccionable",
      caption: "Relay v1.0 · Infraestructura de entrega en producción",
      width: 1280,
      height: 1112,
    },
    sections: [
      {
        eyebrow: "01",
        title: "El problema de confiabilidad",
        lede: "Enviar una solicitud HTTP es sencillo. Preservar la intención de entrega entre timeouts, límites, interrupciones, rotación de secretos e incidentes es un problema de sistemas distribuidos.",
        paragraphs: [
          "Relay garantiza que cada evento aceptado tenga trabajo durable, que los reintentos sean limitados y explicables, que el receptor pueda deduplicar y que exista evidencia suficiente para entender cada resultado.",
        ],
      },
      {
        eyebrow: "02",
        title: "Arquitectura durable",
        paragraphs: [
          "D1 es la fuente de verdad. Queue transporta identificadores listos, mientras un Worker programado republica trabajo pendiente, recupera leases vencidos y aplica retención limitada.",
        ],
        decisions: [
          {
            title: "Al menos una vez, sin prometer exactamente una vez",
            copy: "Un identificador estable permite deduplicación mientras la recuperación acepta que una entrega de red puede repetirse.",
          },
          {
            title: "Outbox transaccional",
            copy: "El evento, el fanout y la intención de publicación se confirman juntos para que el trabajo aceptado no desaparezca.",
          },
          {
            title: "D1 programa; Queue transporta",
            copy: "D1 conserva fechas, política de reintento y recuperación. Queue despierta únicamente el trabajo listo.",
          },
          {
            title: "La evidencia es parte del producto",
            copy: "Cada intento guarda evidencia limitada y redactada para explicar reintentos, replay y resultados terminales.",
          },
          {
            title: "Fallos públicos controlados",
            copy: "Failure Lab ofrece siete comportamientos fijos con Turnstile y cuotas, sin aceptar URLs o payloads arbitrarios.",
          },
        ],
      },
      {
        eyebrow: "03 / Evidencia operativa",
        title: "La historia exacta de cada reintento.",
        media: [
          {
            src: "/projects/relay/relay-delivery-inspector.png",
            alt: "Inspector de Relay con dos intentos HTTP 503 seguidos por un HTTP 200",
            caption:
              "Una entrega, tres intentos persistidos y el motivo de cada reintento",
            width: 1280,
            height: 1740,
          },
        ],
      },
      {
        eyebrow: "04 / Demostración pública",
        title: "Rompe el receptor. Observa cómo Relay se recupera.",
        paragraphs: [
          "Siete escenarios controlados hacen visibles el éxito, los reintentos, rate limiting, timeout, fallos permanentes y agotamiento directamente en producción.",
        ],
        media: [
          {
            src: "/projects/relay/relay-failure-lab.png",
            alt: "Failure Lab de Relay con siete escenarios deterministas",
            caption:
              "Failure Lab · Fallos seguros, deterministas e inspeccionables",
            width: 1280,
            height: 1454,
          },
        ],
      },
      {
        eyebrow: "05",
        title: "Calidad y prueba de producción",
        paragraphs: [
          "La entrega combina pruebas de aplicación y Worker con D1, recorridos de navegador, accesibilidad, seguridad de publicación, límites de costo y un reintento controlado en producción.",
          "En producción, el receptor inestable respondió 500 dos veces y 200 en el tercer intento. Relay mantuvo una identidad estable, generó firmas nuevas y registró cada recibo.",
        ],
        quality: [
          ["283", "pruebas de aplicación y contratos compartidos"],
          ["12", "recorridos de navegador, accesibilidad y responsive"],
          ["9", "verificaciones de publicación y configuración"],
        ],
      },
      {
        eyebrow: "06",
        title: "Resultado",
        lede: "Relay demuestra razonamiento de producción más allá de CRUD: límites transaccionales, concurrencia, criptografía, clasificación de fallos, operación consciente de costos y entrega respaldada por evidencia.",
      },
    ],
    next: { slug: "next", label: "Explorar Next" },
  },
  {
    slug: "next",
    seoTitle: "Caso de estudio de Next",
    seoDescription:
      "Producto, arquitectura, autorización, sincronización en tiempo real y validación de entrega detrás del sistema de turnos Next.",
    version: "Producción v1.0 / 2026",
    summary:
      "Una respuesta sincronizada para tres preguntas: quién espera, quién está siendo atendido y quién sigue.",
    meta: [
      ["Rol", "Diseño de producto + ingeniería full-stack"],
      ["Stack", "Next.js · Supabase · PostgreSQL"],
      ["Calidad", "131 verificaciones documentadas"],
    ],
    cover: {
      src: "/projects/next-queue/landing-page.png",
      alt: "Página inicial del sistema de turnos en tiempo real Next",
      caption: "Next · Experiencia de producción",
      width: 1440,
      height: 900,
    },
    sections: [
      {
        eyebrow: "El producto",
        title: "Un flujo pequeño para tres audiencias distintas.",
        lede: "Las listas de papel y los nombres gritados generan incertidumbre para clientes y coordinación innecesaria para el personal.",
        paragraphs: [
          "Next ofrece al cliente un número y posición estables, al personal un tablero de comandos y a la pantalla pública una vista segura del turno activo. Las tres experiencias comparten estado persistente y convergen sin recarga manual.",
        ],
        steps: [
          "Crear una fila y recibir una capacidad de personal de un solo uso",
          "Permitir que clientes entren sin cuentas permanentes",
          "Llamar, completar, omitir, pausar, reabrir o cerrar desde el tablero",
          "Mantener sincronizadas las vistas de cliente y pantalla pública",
        ],
      },
      {
        eyebrow: "Experiencia del producto",
        title: "Vistas específicas, una sola fila autoritativa.",
        media: [
          {
            src: "/projects/next-queue/staff-board.png",
            alt: "Tablero del personal con turnos en espera, atendidos y completados",
            caption: "Personal · Comandos autorizados y estado en vivo",
            width: 1440,
            height: 900,
          },
          {
            src: "/projects/next-queue/customer-status.png",
            alt: "Estado del cliente con número y posición en la fila",
            caption: "Cliente · Posición, conexión y aviso de turno",
            width: 1440,
            height: 900,
          },
          {
            src: "/projects/next-queue/mobile-view.png",
            alt: "Interfaz móvil de cliente de Next",
            caption: "Experiencia móvil responsiva",
            width: 375,
            height: 812,
            mobile: true,
          },
        ],
      },
      {
        eyebrow: "Arquitectura",
        title: "La autorización y la consistencia viven con los datos.",
        paragraphs: [
          "Next.js sirve la interfaz desde Vercel. Supabase aporta autenticación anónima, PostgreSQL, RPC y señales Realtime filtradas. El navegador recibe solo configuración pública; las credenciales privilegiadas nunca entran en la aplicación.",
        ],
        decisions: [
          {
            title: "Comandos aplicados por la base de datos",
            copy: "El navegador no escribe tablas directamente. Cada mutación cruza una función PostgreSQL que autoriza y aplica un cambio atómico.",
          },
          {
            title: "Realtime como invalidación",
            copy: "La señal indica que algo cambió; cada cliente solicita un snapshot autoritativo con revisión e ignora respuestas antiguas.",
          },
          {
            title: "Transiciones idempotentes",
            copy: "Cada comando recibe un UUID. Los reintentos seguros devuelven el resultado actual y el uso incompatible se rechaza.",
          },
          {
            title: "Privacidad por separación",
            copy: "Las pantallas públicas muestran números. Los nombres opcionales viven en una tabla privada disponible solo para personal autorizado.",
          },
        ],
      },
      {
        eyebrow: "Evidencia de entrega",
        title: "Calidad medida en el sistema completo.",
        paragraphs: [
          "La entrega se validó en interfaz, dominio, base de datos, integración, navegador y producción. La documentación registra límites del plan gratuito, identidad anónima y fronteras operativas sin presentar un proyecto de portafolio como servicio empresarial.",
        ],
        quality: [
          ["34", "verificaciones unitarias y de componentes"],
          ["62", "verificaciones de autorización en base de datos"],
          ["11", "verificaciones de integración con Supabase"],
          ["15", "recorridos de navegador"],
          ["9", "smoke tests de producción"],
        ],
      },
    ],
    next: { slug: "careerflow", label: "Explorar CareerFlow" },
  },
  {
    slug: "careerflow",
    seoTitle: "Caso de estudio de CareerFlow",
    seoDescription:
      "Cómo CareerFlow reúne solicitudes, fechas, métricas y versiones del currículum en un producto full-stack desplegado.",
    version: "2026 / v1.0",
    summary:
      "Una aplicación desplegada para organizar oportunidades laborales, progreso, fechas límite y versiones específicas del currículum.",
    meta: [
      ["Rol", "Diseño de producto + ingeniería full-stack"],
      ["Plataforma", "Web"],
      ["Despliegue", "Vercel + Neon"],
      ["Repositorio", "Público"],
    ],
    cover: {
      src: "/projects/careerflow/careerflow-dashboard-desktop.png",
      alt: "Dashboard de CareerFlow con solicitudes resumidas por estado y fechas",
      caption: "CareerFlow · Datos de portafolio en producción",
      width: 1440,
      height: 1592,
    },
    sections: [
      {
        eyebrow: "01",
        title: "El problema",
        lede: "Una búsqueda de empleo seria produce oportunidades en distintas etapas, seguimientos, salarios, fechas límite y varias versiones del currículum.",
        paragraphs: [
          "Esa información suele fragmentarse entre notas, marcadores, hojas de cálculo, calendarios y archivos. CareerFlow la reúne en un sistema enfocado y aislado por cuenta, sin convertirse en una suite de productividad ruidosa.",
        ],
      },
      {
        eyebrow: "02",
        title: "El flujo del producto",
        paragraphs: [
          "La experiencia sigue una oportunidad desde su captura hasta el resultado final y mantiene conectada la versión del currículum utilizada.",
        ],
        steps: [
          "Registrarse e iniciar sesión",
          "Guardar una oportunidad",
          "Actualizar estado y fechas",
          "Buscar y filtrar",
          "Revisar métricas del dashboard",
          "Conectar una versión del currículum",
        ],
      },
      {
        eyebrow: "03 / Experiencia",
        title: "Una búsqueda creciente que sigue siendo accionable.",
        media: [
          {
            src: "/projects/careerflow/careerflow-applications-desktop.png",
            alt: "Lista de solicitudes de CareerFlow con búsqueda, filtros y fechas",
            caption: "Búsqueda y filtros combinados sobre las oportunidades",
            width: 1440,
            height: 1193,
          },
          {
            src: "/projects/careerflow/careerflow-resumes-desktop.png",
            alt: "Biblioteca de currículums y versiones de CareerFlow",
            caption: "Familias de currículum con versiones específicas",
            width: 1440,
            height: 1000,
          },
          {
            src: "/projects/careerflow/careerflow-dashboard-mobile.png",
            alt: "Dashboard de CareerFlow en una pantalla móvil",
            caption: "El flujo completo permanece disponible en móvil",
            width: 375,
            height: 812,
            mobile: true,
          },
        ],
      },
      {
        eyebrow: "04",
        title: "Arquitectura y decisiones importantes",
        paragraphs: [
          "Una aplicación Next.js combina interfaces React y lógica del servidor. Auth.js establece identidad, Prisma persiste datos propios en PostgreSQL sobre Neon y Vercel aloja la aplicación.",
        ],
        decisions: [
          {
            title: "Autenticación Credentials con sesiones JWT",
            copy: "Las sesiones cifradas encajan con esta estrategia de proveedor sin presentar la decisión como un valor universal.",
          },
          {
            title: "Aislamiento de propiedad",
            copy: "Cada operación se limita al usuario autenticado en el servidor; conocer un identificador nunca concede autorización.",
          },
          {
            title: "Dinero en unidades menores",
            copy: "Los salarios usan unidades ISO 4217 para evitar errores de coma flotante.",
          },
          {
            title: "Modelo de fechas consistente",
            copy: "La versión 1.0 usa UTC de forma coherente en lugar de una zona horaria parcialmente implementada.",
          },
          {
            title: "Familias y versiones de currículum",
            copy: "Una familia comparte identidad mientras cada versión conserva su etiqueta y relación con una oportunidad.",
          },
          {
            title: "Historial de migraciones estable",
            copy: "Las migraciones desplegadas se preservan en lugar de reescribirse por conveniencia de presentación.",
          },
        ],
      },
      {
        eyebrow: "05",
        title: "Calidad y validación",
        paragraphs: [
          "La validación cubrió build de producción, migraciones, autenticación, rutas protegidas, aislamiento de propiedad, navegador en escritorio y móvil, y revisión de accesibilidad. Es evidencia de entrega, no una certificación formal.",
        ],
        quality: [
          ["179", "pruebas aprobadas con PostgreSQL habilitado"],
          [
            "150 + 29",
            "pruebas base y pruebas condicionadas por base de datos",
          ],
          ["0", "vulnerabilidades conocidas de npm en el punto de entrega"],
        ],
      },
      {
        eyebrow: "06",
        title: "Accesibilidad y operación",
        paragraphs: [
          "Controles semánticos, navegación por teclado, foco visible, diálogos administrados, errores conectados, drawer móvil accesible y soporte de movimiento reducido se trataron como comportamiento del producto.",
          "La versión funciona dentro de los planes gratuitos de Vercel y Neon. La documentación declara cuotas, cold starts y límites operativos sin prometer un SLA comercial.",
        ],
      },
      {
        eyebrow: "07",
        title: "Resultado",
        lede: "CareerFlow demuestra el ciclo completo: alcance de producto, autenticación, datos relacionales, interfaces responsivas y accesibles, pruebas automatizadas, despliegue y documentación honesta.",
      },
    ],
    next: { slug: null, label: "Volver a proyectos seleccionados" },
  },
] as const;

export function getSpanishCaseStudy(slug: string) {
  return spanishCaseStudies.find((study) => study.slug === slug);
}

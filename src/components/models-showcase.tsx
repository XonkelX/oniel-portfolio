"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { KeyboardStage } from "@/components/keyboard-stage";
import type { homeCopy } from "@/content/home";
import "./models-showcase.css";

type ModelsCopy = ReturnType<typeof homeCopy>["models"];

/** The parts of the <model-viewer> element API this section uses. */
type ModelViewerElement = HTMLElement & {
  animationName: string | null;
  currentTime: number;
  play: (options?: { repetitions?: number }) => void;
  pause: () => void;
};

type View = {
  /** "three" models get their own three.js stage instead of model-viewer. */
  stage?: "three";
  orbit: string;
  min?: string;
  max?: string;
  /** Narrow field of view flattens perspective toward an isometric look. */
  fov?: string;
  /** The near-black controller needs more light under model-viewer's neutral environment. */
  exposure?: string;
  autoRotate: boolean;
  animations: string[];
  /** Looping animation played on load and after any one-shot animation finishes. */
  rest?: string;
};

// Camera framing per model. The diorama is a cut-away room, so its orbit stays on the open side.
const VIEWS: Record<string, View> = {
  diorama: {
    orbit: "40deg 62deg auto",
    min: "-10deg 30deg auto",
    max: "100deg 85deg auto",
    fov: "22deg",
    autoRotate: false,
    animations: [],
  },
  keyboard: {
    stage: "three",
    orbit: "",
    autoRotate: false,
    animations: [],
  },
  controller: {
    // Pulled back so the exploded parts (about 5 cm above the shell) stay in frame.
    orbit: "25deg 62deg 0.46m",
    max: "auto auto 0.7m",
    exposure: "1.35",
    autoRotate: true,
    animations: ["Explode"],
  },
  robot: {
    orbit: "20deg 78deg 3.3m",
    max: "auto auto 4.5m",
    autoRotate: false,
    animations: ["Idle", "Wave", "Spin"],
    rest: "Idle",
  },
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Interactive Blender models: one large viewer and a picker. model-viewer loads only near the viewport. */
export function ModelsShowcase({ copy }: { copy: ModelsCopy }) {
  const section = useRef<HTMLElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const [active, setActive] = useState<string>(copy.items[0].id);
  const [libReady, setLibReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  const view = VIEWS[active];
  const item = copy.items.find((entry) => entry.id === active) ?? copy.items[0];

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        import("@google/model-viewer")
          .then(() => setLibReady(true))
          .catch(() => {});
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mv = viewer.current;
    if (!mv || !libReady) return;
    const rest = VIEWS[active].rest;

    function onLoad() {
      setLoaded(true);
      if (rest && mv && !reduceMotion) {
        mv.animationName = rest;
        mv.play();
        setPlaying(rest);
      }
    }
    function onFinished() {
      if (!mv) return;
      if (rest) {
        mv.animationName = rest;
        mv.currentTime = 0;
        mv.play();
        setPlaying(rest);
      } else {
        setPlaying(null);
      }
    }
    mv.addEventListener("load", onLoad);
    mv.addEventListener("finished", onFinished);
    return () => {
      mv.removeEventListener("load", onLoad);
      mv.removeEventListener("finished", onFinished);
    };
  }, [active, libReady, reduceMotion]);

  const markLoaded = useCallback(() => setLoaded(true), []);

  function choose(id: string) {
    if (id === active) return;
    setLoaded(false);
    setPlaying(null);
    setActive(id);
  }

  function playAnimation(name: string) {
    const mv = viewer.current;
    if (!mv) return;
    const loops = name === view.rest;
    mv.animationName = name;
    mv.currentTime = 0;
    // One-shot clips play once (the controller explodes and reassembles), then return to rest.
    mv.play(loops ? undefined : { repetitions: 1 });
    setPlaying(name);
  }

  return (
    <section
      ref={section}
      className="vino-models"
      id={copy.id}
      aria-labelledby="vino-models-title"
    >
      <div className="vino-wrap">
        <div className="vino-models__head">
          <div>
            <p className="vino-models__eyebrow">{copy.eyebrow}</p>
            <h2 id="vino-models-title">
              {copy.titleTop} <em>{copy.titleBottom}</em>
            </h2>
          </div>
          <div className="vino-models__side">
            <p>{copy.intro}</p>
            <ul className="vino-models__chips">
              {copy.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="vino-models__layout">
          <figure className="vino-stage" data-loaded={loaded}>
            {/* Poster stays until the model has loaded, and is the whole experience without JS. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="vino-stage__poster"
              src={`/models/${active}.webp`}
              alt={loaded ? "" : item.alt}
              aria-hidden={loaded}
              width={1200}
              height={1200}
              decoding="async"
            />
            {libReady && view.stage === "three" && (
              <KeyboardStage
                key={active}
                copy={{
                  alt: item.alt,
                  typingLabel: copy.typingLabel,
                  placeholder: copy.typingPlaceholder,
                }}
                onLoad={markLoaded}
              />
            )}
            {libReady && view.stage !== "three" && (
              <model-viewer
                key={active}
                ref={viewer}
                className="vino-stage__viewer"
                src={`/models/${active}.glb`}
                alt={item.alt}
                loading="eager"
                camera-controls
                disable-pan
                touch-action="pan-y"
                interaction-prompt="none"
                camera-orbit={view.orbit}
                min-camera-orbit={view.min}
                max-camera-orbit={view.max}
                field-of-view={view.fov}
                max-field-of-view={view.fov}
                auto-rotate={view.autoRotate && !reduceMotion}
                auto-rotate-delay="1200"
                rotation-per-second="18deg"
                environment-image="neutral"
                exposure={view.exposure ?? "1.05"}
                shadow-intensity="0.9"
                shadow-softness="0.9"
              />
            )}
            {!loaded && (
              <span className="vino-stage__status" role="status">
                {copy.loading}
              </span>
            )}
            <figcaption>
              <b>{item.name}</b>
              <span>
                {view.stage === "three" ? copy.keyboardHint : copy.hint}
              </span>
            </figcaption>
            {view.animations.length > 0 && (
              <div
                className="vino-stage__anims"
                role="group"
                aria-label={copy.animationsLabel}
              >
                {view.animations.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={playing === name}
                    disabled={!loaded}
                    onClick={() => playAnimation(name)}
                  >
                    {copy.animations[name] ?? name}
                  </button>
                ))}
              </div>
            )}
          </figure>

          <ul className="vino-models__list" aria-label={copy.listLabel}>
            {copy.items.map((entry, index) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="vino-model-card"
                  aria-pressed={entry.id === active}
                  onClick={() => choose(entry.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/models/${entry.id}.webp`}
                    alt=""
                    width={1200}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <small>0{index + 1}</small>
                    <b>{entry.name}</b>
                    <span>{entry.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="vino-models__spec">{copy.spec}</p>
      </div>
    </section>
  );
}

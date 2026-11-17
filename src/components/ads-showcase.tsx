"use client";

import { useEffect, useRef, useState } from "react";
import type { homeCopy } from "@/content/home";

type AdsCopy = ReturnType<typeof homeCopy>["ads"];

/** Three vertical ad samples that play muted while visible; one at a time can play with sound. */
export function AdsShowcase({
  copy,
  contactHref,
}: {
  copy: AdsCopy;
  contactHref: string;
}) {
  const [loud, setLoud] = useState<string | null>(null);
  const videos = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && (!reduceMotion || !video.muted)) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.35 },
    );
    for (const video of Object.values(videos.current)) {
      if (!video) continue;
      // React does not render the muted attribute on the server, so set it before any play().
      video.muted = true;
      observer.observe(video);
    }
    return () => observer.disconnect();
  }, []);

  function toggleSound(id: string) {
    const next = loud === id ? null : id;
    for (const [key, video] of Object.entries(videos.current)) {
      if (!video) continue;
      video.muted = key !== next;
      if (key === next) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
    setLoud(next);
  }

  return (
    <section className="vino-ads" id={copy.id} aria-labelledby="vino-ads-title">
      <div className="vino-wrap">
        <div className="vino-ads__head">
          <div>
            <p className="vino-ads__eyebrow">{copy.eyebrow}</p>
            <h2 id="vino-ads-title">
              {copy.titleTop} <em>{copy.titleBottom}</em>
            </h2>
          </div>
          <div className="vino-ads__side">
            <p>{copy.intro}</p>
            <ul className="vino-ads__chips">
              {copy.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="vino-phones">
          {copy.samples.map((sample) => (
            <figure
              className="vino-phone"
              data-loud={loud === sample.id}
              key={sample.id}
            >
              <div className="vino-phone__body">
                <video
                  ref={(node) => {
                    videos.current[sample.id] = node;
                  }}
                  src={`/ads/${sample.id}.mp4`}
                  poster={`/ads/${sample.id}.jpg`}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={sample.label}
                  onClick={() => toggleSound(sample.id)}
                />
                <button
                  className="vino-phone__sound"
                  type="button"
                  aria-pressed={loud === sample.id}
                  aria-label={`${copy.soundLabel} ${sample.brand}`}
                  onClick={() => toggleSound(sample.id)}
                >
                  {loud === sample.id ? copy.soundOn : copy.soundOff}
                </button>
              </div>
              <figcaption>
                <b>{sample.brand}</b>
                <span>{sample.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="vino-ads__spec">{copy.spec}</p>

        <ol className="vino-steps">
          {copy.steps.map((step, index) => (
            <li key={step.title}>
              <small>0{index + 1}</small>
              <b>{step.title}</b>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>

        <div className="vino-ads__cta">
          <a className="vino-btn vino-btn--green" href={contactHref}>
            {copy.cta} <span aria-hidden="true">→</span>
          </a>
          <p>{copy.ctaNote}</p>
        </div>
      </div>
    </section>
  );
}

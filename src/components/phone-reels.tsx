"use client";

import { useEffect, useRef, useState } from "react";

export type Reel = {
  id: string;
  src: string;
  poster: string;
  label: string;
  title: string;
  detail: string;
};

/** Fired on window so only one reel on the page plays with sound, across sections. */
const SOUND_EVENT = "vino:sound";

/** Vertical videos in phone frames: muted while visible, one at a time with sound. */
export function PhoneReels({
  reels,
  soundOn,
  soundOff,
  soundLabel,
}: {
  reels: readonly Reel[];
  soundOn: string;
  soundOff: string;
  soundLabel: string;
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

    function onSound(event: Event) {
      const id = (event as CustomEvent<string | null>).detail;
      if (id !== null && id in videos.current) return;
      for (const video of Object.values(videos.current)) {
        if (video) video.muted = true;
      }
      setLoud(null);
    }
    window.addEventListener(SOUND_EVENT, onSound);
    return () => {
      observer.disconnect();
      window.removeEventListener(SOUND_EVENT, onSound);
    };
  }, []);

  function toggleSound(id: string) {
    const next = loud === id ? null : id;
    if (next) {
      window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: next }));
    }
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
    <div className="vino-phones">
      {reels.map((reel) => (
        <figure
          className="vino-phone"
          data-loud={loud === reel.id}
          key={reel.id}
        >
          <div className="vino-phone__body">
            <video
              ref={(node) => {
                videos.current[reel.id] = node;
              }}
              src={reel.src}
              poster={reel.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={reel.label}
              onClick={() => toggleSound(reel.id)}
            />
            <button
              className="vino-phone__sound"
              type="button"
              aria-pressed={loud === reel.id}
              aria-label={`${soundLabel} ${reel.title}`}
              onClick={() => toggleSound(reel.id)}
            >
              {loud === reel.id ? soundOn : soundOff}
            </button>
          </div>
          <figcaption>
            <b>{reel.title}</b>
            <span>{reel.detail}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

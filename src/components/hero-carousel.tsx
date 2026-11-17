"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { homeCopy } from "@/content/home";

type HeroCopy = ReturnType<typeof homeCopy>["hero"];

/** Homepage hero: project screens on a 3D ring that spins slowly and can be dragged. */
export function HeroCarousel({
  copy,
  hrefPrefix,
}: {
  copy: HeroCopy;
  hrefPrefix: string;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState(0);
  const facing = copy.panels[front];

  useEffect(() => {
    const hero = heroRef.current;
    const ring = ringRef.current;
    if (!hero || !ring) return;
    const panels = Array.from(ring.children) as HTMLElement[];
    const count = panels.length;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let radius = 400;
    let angle = 0;
    let velocity = 0;
    let lastX = 0;
    let dragging = false;
    let visible = true;
    let frontIndex = 0;
    let frame = 0;

    function draw() {
      ring!.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
      let best = 0;
      let bestDistance = 999;
      panels.forEach((panel, index) => {
        const a = ((((index * 360) / count + angle) % 360) + 360) % 360;
        const distance = Math.min(a, 360 - a);
        panel.style.filter = `brightness(${Math.max(0.28, 1 - distance / 200)})`;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      if (best !== frontIndex) {
        frontIndex = best;
        setFront(best);
      }
    }

    function size() {
      const width =
        window.innerWidth < 700
          ? window.innerWidth * 0.62
          : Math.min(window.innerWidth * 0.34, 480);
      ring!.style.setProperty("--pw", `${width}px`);
      radius = width / 2 / Math.tan(Math.PI / count) + width * 0.12;
      panels.forEach((panel, index) => {
        panel.style.transform = `rotateY(${(index * 360) / count}deg) translateZ(${radius}px)`;
      });
      draw();
    }

    function tick() {
      if (visible && !document.hidden) {
        if (!dragging) {
          if (Math.abs(velocity) > 0.02) {
            angle += velocity;
            velocity *= 0.94;
          } else if (!reduceMotion) {
            angle -= 0.07;
          }
        }
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function onPointerDown(event: PointerEvent) {
      if ((event.target as Element).closest("a, button")) return;
      dragging = true;
      lastX = event.clientX;
      velocity = 0;
      hero!.classList.add("is-dragging");
      hero!.setPointerCapture(event.pointerId);
    }
    function onPointerMove(event: PointerEvent) {
      if (!dragging) return;
      velocity = (event.clientX - lastX) * 0.22;
      lastX = event.clientX;
      angle += velocity;
    }
    function onPointerEnd() {
      dragging = false;
      hero!.classList.remove("is-dragging");
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(hero);
    hero.addEventListener("pointerdown", onPointerDown);
    hero.addEventListener("pointermove", onPointerMove);
    hero.addEventListener("pointerup", onPointerEnd);
    hero.addEventListener("pointercancel", onPointerEnd);
    window.addEventListener("resize", size);
    size();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerup", onPointerEnd);
      hero.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <section ref={heroRef} className="mz-hero" aria-labelledby="mz-name">
      <div className="mz-stage" aria-hidden="true">
        <div ref={ringRef} className="mz-ring">
          {copy.panels.map((panel, index) => (
            <div className="mz-panel" key={panel.image}>
              <Image
                src={panel.image}
                alt=""
                width={1440}
                height={900}
                priority={index < 2}
                draggable={false}
                sizes="(max-width: 700px) 62vw, 480px"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mz-bottom">
        <div className="vino-wrap mz-bottom__inner">
          <h1 id="mz-name" className="mz-name">
            <span>Oniel</span> <span>Alejo</span> <em>Feliz</em>
          </h1>
          <div className="mz-facing">
            <span className="mz-facing__label">{copy.facing}</span>
            <b>{facing.name}</b>
            <p>{facing.desc}</p>
            <Link href={`${hrefPrefix}${facing.slug}`}>
              {copy.open}
              <span className="sr-only">: {facing.name}</span>{" "}
              <span aria-hidden="true">→</span>
            </Link>
            <span className="mz-facing__hint" aria-hidden="true">
              {copy.drag} ⟲
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

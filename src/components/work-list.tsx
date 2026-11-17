"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import type { WorkItem } from "@/content/home";

type WorkListProps = {
  items: readonly WorkItem[];
  hrefPrefix: string;
  caseLabel: string;
};

/** Project list with a cursor-following screenshot on pointer devices and inline screenshots on touch. */
export function WorkList({ items, hrefPrefix, caseLabel }: WorkListProps) {
  const [active, setActive] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  function followPointer(event: MouseEvent<HTMLDivElement>) {
    const preview = previewRef.current;
    if (!preview) return;
    preview.style.translate = `${event.clientX + 28}px ${event.clientY - 130}px`;
  }

  return (
    <div
      className="vino-list"
      onMouseMove={followPointer}
      onMouseLeave={() => setActive(null)}
    >
      <ul>
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              className="vino-row"
              href={`${hrefPrefix}${item.slug}`}
              onMouseEnter={() => setActive(item.slug)}
            >
              <h3 className="vino-row__name">{item.name}</h3>
              <span className="vino-row__desc">
                {item.tagline}
                <small>{item.stack}</small>
                <span className="sr-only">, {caseLabel}</span>
              </span>
              <Image
                className="vino-row__thumb"
                src={item.image}
                alt=""
                width={1440}
                height={900}
                sizes="(max-width: 760px) 92vw, 1px"
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="vino-preview" ref={previewRef} aria-hidden="true">
        {items.map((item) => (
          <Image
            key={item.slug}
            src={item.image}
            alt=""
            width={800}
            height={500}
            sizes="400px"
            data-active={active === item.slug}
          />
        ))}
      </div>
    </div>
  );
}

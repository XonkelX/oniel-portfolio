"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { careerFlow } from "@/content/projects";

export function ProjectVisual({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`project-visual${compact ? "project-visual--compact" : ""}`}
      initial={false}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <figure className="browser-frame">
        <figcaption>
          <span aria-hidden="true" />
          careerflow-snowy.vercel.app
        </figcaption>
        <Image
          src={
            compact
              ? "/projects/careerflow/careerflow-applications-desktop.png"
              : careerFlow.coverImage
          }
          alt={
            compact
              ? "CareerFlow application list with search, combined filters, statuses, salary ranges, and deadlines"
              : "CareerFlow dashboard showing application totals, status progress, upcoming deadlines, and recent activity"
          }
          width={1440}
          height={1592}
          sizes="(max-width: 768px) 96vw, 75vw"
          loading={compact ? "lazy" : "eager"}
          fetchPriority={compact ? "auto" : "high"}
          quality={90}
        />
      </figure>
      {!compact ? (
        <figure className="device-frame">
          <Image
            src={careerFlow.mobileImage}
            alt="CareerFlow responsive dashboard at mobile width"
            width={375}
            height={812}
            sizes="160px"
            loading="eager"
            quality={90}
          />
          <figcaption>Responsive workspace</figcaption>
        </figure>
      ) : null}
    </motion.div>
  );
}

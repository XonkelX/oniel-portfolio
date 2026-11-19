import type { DetailedHTMLProps, HTMLAttributes } from "react";

/** Minimal JSX typing for the <model-viewer> web component (attributes are passed through as-is). */
type ModelViewerAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  [attribute: `${string}-${string}`]: string | boolean | undefined;
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  exposure?: string;
  autoplay?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

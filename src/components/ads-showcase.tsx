import { PhoneReels } from "@/components/phone-reels";
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

        <PhoneReels
          reels={copy.samples.map((sample) => ({
            id: sample.id,
            src: `/ads/${sample.id}.mp4`,
            poster: `/ads/${sample.id}.jpg`,
            label: sample.label,
            title: sample.brand,
            detail: sample.detail,
          }))}
          soundOn={copy.soundOn}
          soundOff={copy.soundOff}
          soundLabel={copy.soundLabel}
        />
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

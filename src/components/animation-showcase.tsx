import { PhoneReels } from "@/components/phone-reels";
import type { homeCopy } from "@/content/home";

type HomeCopy = ReturnType<typeof homeCopy>;

/** 3D animation: previews of animated Shorts episodes, in the same phone frames as the ads. */
export function AnimationShowcase({
  copy,
  sound,
}: {
  copy: HomeCopy["animation"];
  sound: Pick<HomeCopy["ads"], "soundOn" | "soundOff" | "soundLabel">;
}) {
  return (
    <section
      className="vino-ads vino-anim"
      id={copy.id}
      aria-labelledby="vino-anim-title"
    >
      <div className="vino-wrap">
        <div className="vino-ads__head">
          <div>
            <p className="vino-ads__eyebrow">{copy.eyebrow}</p>
            <h2 id="vino-anim-title">
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
          reels={copy.episodes.map((episode) => ({
            id: episode.id,
            src: `/animation/${episode.id}.mp4`,
            poster: `/animation/${episode.id}.jpg`,
            label: episode.label,
            title: episode.title,
            detail: episode.tools,
          }))}
          soundOn={sound.soundOn}
          soundOff={sound.soundOff}
          soundLabel={sound.soundLabel}
        />
        <p className="vino-ads__spec">{copy.spec}</p>
      </div>
    </section>
  );
}

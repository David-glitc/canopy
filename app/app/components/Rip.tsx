"use client";

import { useState } from "react";

type Props = {
  imageUrl: string;
  title: string;
  subtitle: string;
  shareUrl: string;
  onClaim: () => void;
  claiming: boolean;
  claimed: boolean;
};

export default function Rip({
  imageUrl,
  title,
  subtitle,
  shareUrl,
  onClaim,
  claiming,
  claimed,
}: Props) {
  const [stage, setStage] = useState<"sealed" | "tearing" | "revealed">("sealed");
  const [copied, setCopied] = useState(false);

  function rip() {
    if (stage !== "sealed") return;
    setStage("tearing");
    window.setTimeout(() => setStage("revealed"), 900);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[340px] select-none overflow-hidden rounded-2xl border border-[var(--canopy-line)] bg-black">
        {stage === "revealed" ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full animate-[rip-in_0.7s_ease-out] object-cover"
            draggable={false}
          />
        ) : (
          <button
            onClick={rip}
            className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_50%_40%,#12261c_0%,#050505_70%)]"
            aria-label="Rip the seal"
          >
            <img
              src="/mark.svg"
              alt=""
              width={84}
              height={84}
              className={`transition-transform duration-500 ${
                stage === "tearing" ? "scale-150 opacity-0" : "group-hover:scale-110"
              } drop-shadow-[0_0_35px_rgba(20,241,149,0.45)]`}
              draggable={false}
            />
            <span
              className={`font-mono2 text-xs tracking-[0.4em] text-[var(--canopy-green)] ${
                stage === "tearing" ? "opacity-0" : "animate-pulse"
              }`}
            >
              {stage === "tearing" ? "···" : "TAP TO RIP"}
            </span>
            {stage === "tearing" && (
              <span className="animate-[rip-flash_0.9s_ease-out] absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(20,241,149,0.55),rgba(153,69,255,0.25)_55%,transparent_75%)]" />
            )}
            <span className="absolute inset-x-8 bottom-6 h-px bg-gradient-to-r from-transparent via-[var(--canopy-green)] to-transparent opacity-60" />
          </button>
        )}
      </div>

      {stage === "revealed" && (
        <div className="mt-6 text-center">
          <h3 className="font-display text-xl font-extrabold">{title}</h3>
          <p className="mt-1 font-mono2 text-xs text-[var(--canopy-green)]">{subtitle}</p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={onClaim}
              disabled={claiming || claimed}
              className="btn-primary flex-1 px-6 py-3 text-sm disabled:opacity-40"
            >
              {claimed ? "Claimed ✓" : claiming ? "Claiming…" : "Claim backing"}
            </button>
            <button onClick={copy} className="btn-ghost flex-1 px-6 py-3 text-sm">
              {copied ? "Link copied ✓" : "Share"}
            </button>
          </div>
          <button
            onClick={() => setStage("sealed")}
            className="mt-3 font-mono2 text-xs text-[var(--canopy-muted)] hover:text-[var(--canopy-text)]"
          >
            replay rip ↺
          </button>
        </div>
      )}

      <style>{`
        @keyframes rip-in {
          0% { transform: scale(1.25) rotate(-2deg); filter: brightness(3) saturate(0.4); opacity: 0; }
          55% { transform: scale(0.98) rotate(0.5deg); filter: brightness(1.6); opacity: 1; }
          100% { transform: scale(1) rotate(0); filter: none; }
        }
        @keyframes rip-flash {
          0% { opacity: 0; transform: scale(0.7); }
          35% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

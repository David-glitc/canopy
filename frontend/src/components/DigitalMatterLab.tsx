"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const SPECIMENS = [
  {
    id: "09A7·2E11", name: "Root Sentinel", form: "Sentinel", matter: "Bark",
    core: "Seed", crown: "Branches", aura: "Root Signal", motion: "Rooted",
    tone: "lime", path: "M160 96h-34v28H98v44H72v102h26v54h28v38h68v-38h28v-54h26V168h-26v-44h-28V96z",
  },
  {
    id: "B81C·F040", name: "Prism Oracle", form: "Oracle", matter: "Crystal",
    core: "Prism", crown: "Orbit", aura: "Solar Rays", motion: "Ascending",
    tone: "violet", path: "M160 88l-54 42v46L72 214l34 38v68l54 50 54-50v-68l34-38-34-38v-46z",
  },
  {
    id: "46D2·991A", name: "Spore Bloom", form: "Bloom", matter: "Mycelium",
    core: "Halo", crown: "Antennae", aura: "Spore Field", motion: "Emergent",
    tone: "cyan", path: "M160 96l-26 28-40-8 8 42-30 28 26 28-18 38 40 12v60l40 38 40-38v-60l40-12-18-38 26-28-30-28 8-42-40 8z",
  },
] as const;

const PIXELS = [
  [43, 83], [268, 102], [36, 211], [277, 246], [58, 328], [248, 346],
  [91, 65], [235, 73], [53, 151], [270, 174], [75, 382], [259, 393],
];

export default function DigitalMatterLab({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const specimen = SPECIMENS[selected];
  const traits = [
    ["Form", specimen.form],
    ["Matter", specimen.matter],
    ["Core", specimen.core],
    ["Crown", specimen.crown],
    ["Aura", specimen.aura],
    ["Motion", specimen.motion],
  ];

  return (
    <div className={cn("matter-lab", compact && "matter-lab-compact")}>
      <div className={cn("matter-specimen", `matter-tone-${specimen.tone}`)}>
        <div className="matter-specimen-head">
          <span>SPECIMEN / {specimen.id}</span>
          <i>LIVE ASSEMBLY</i>
        </div>
        <svg viewBox="0 0 320 460" role="img" aria-label={`Procedural specimen: ${specimen.name}`}>
          <defs>
            <pattern id="matter-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0H0V16" fill="none" className="matter-grid-line" />
            </pattern>
          </defs>
          <rect width="320" height="460" fill="url(#matter-grid)" />
          <circle cx="160" cy="218" r="112" className="matter-orbit" />
          <path d={specimen.path} className="matter-body-fill" />
          <path d={specimen.path} className="matter-trace" pathLength="1" />
          {PIXELS.map(([x, y], index) => (
            <rect key={index} x={x} y={y} width={index % 3 === 0 ? 7 : 4} height={index % 3 === 0 ? 7 : 4} className="matter-pixel" style={{ "--pixel-delay": `${160 + index * 36}ms` } as CSSProperties} />
          ))}
          <path d="M160 194l28 30-28 30-28-30z" className="matter-core" />
          <rect x="143" y="148" width="12" height="12" className="matter-eye" />
          <rect x="165" y="148" width="12" height="12" className="matter-eye" />
        </svg>
        <div className="matter-specimen-foot">
          <strong>{specimen.name}</strong>
          <span>DNA {specimen.id}</span>
        </div>
      </div>

      {!compact && (
        <div className="matter-console">
          <div className="matter-console-head">
            <div><span>GENOTYPE READER</span><strong>{specimen.name}</strong></div>
            <button type="button" onClick={() => setSelected((value) => (value + 1) % SPECIMENS.length)}>Next genotype ↻</button>
          </div>
          <div className="matter-code">
            <span>0x</span><strong>{specimen.id.replace("·", "")}1BF4A09C</strong><i>VERIFIED SEED</i>
          </div>
          <div className="matter-traits">
            {traits.map(([label, value], index) => (
              <div key={label} style={{ "--trait-delay": `${index * 45}ms` } as CSSProperties}>
                <span>{label}</span><strong>{value}</strong><i>{String(index + 1).padStart(2, "0")}</i>
              </div>
            ))}
          </div>
          <div className="matter-samples" aria-label="Select a specimen genotype">
            {SPECIMENS.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setSelected(index)} className={cn(index === selected && "is-selected")}>
                <i className={`matter-swatch matter-tone-${item.tone}`} />
                <span>{item.form}<small>{item.id}</small></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

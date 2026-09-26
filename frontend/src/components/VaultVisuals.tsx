"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

function chartGeometry(values: number[]) {
  const safe = values.length > 1 ? values : [0, values[0] ?? 0];
  const max = Math.max(...safe, 1);
  const points = safe.map((value, index) => ({
    x: 18 + (index / (safe.length - 1)) * 564,
    y: 202 - (value / max) * 174,
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = `${line} L582,212 L18,212 Z`;
  return { line, area, last: points.at(-1)! };
}

export function FundingCurve({
  values,
  compact = false,
  label = "Cumulative funding",
}: {
  values: number[];
  compact?: boolean;
  label?: string;
}) {
  const id = useId().replaceAll(":", "");
  const { line, area, last } = chartGeometry(values);

  return (
    <div className={cn("vault-chart", compact && "vault-chart-compact")}>
      <svg viewBox="0 0 600 230" role="img" aria-label={label} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`funding-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--lime)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[46, 101, 156, 211].map((y) => (
          <line key={y} x1="18" y1={y} x2="582" y2={y} className="vault-chart-grid" />
        ))}
        <path d={area} fill={`url(#funding-${id})`} />
        <path d={line} className="vault-chart-line" pathLength="1" />
        <circle cx={last.x} cy={last.y} r="5" className="vault-chart-dot" />
      </svg>
    </div>
  );
}

const CYCLE = ["Fund", "Close", "Commit", "Reveal"];

export function VaultCycle({
  status,
  revealStarted = false,
  revealReady = false,
}: {
  status: number;
  revealStarted?: boolean;
  revealReady?: boolean;
}) {
  const active = status === 0 ? 0 : status === 1 ? (revealReady ? 3 : revealStarted ? 2 : 1) : 3;

  return (
    <div className="vault-cycle" aria-label="Vault lifecycle">
      {CYCLE.map((label, index) => (
        <div key={label} className={cn("vault-cycle-step", index < active && "is-done", index === active && "is-active")}>
          <span>{index < active ? "✓" : index + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

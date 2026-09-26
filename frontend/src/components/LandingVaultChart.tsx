"use client";

import CompanyLogo from "@/components/CompanyLogo";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";

const fundingCurve = [
  { date: new Date("2026-10-01T09:00:00Z"), funded: 4 },
  { date: new Date("2026-10-01T09:06:00Z"), funded: 13 },
  { date: new Date("2026-10-01T09:12:00Z"), funded: 25 },
  { date: new Date("2026-10-01T09:18:00Z"), funded: 43 },
  { date: new Date("2026-10-01T09:24:00Z"), funded: 58 },
  { date: new Date("2026-10-01T09:30:00Z"), funded: 74 },
  { date: new Date("2026-10-01T09:36:00Z"), funded: 100 },
];

export default function LandingVaultChart() {
  return (
    <div className="landing-chart" aria-label="Illustrative Canopy vault funding curve">
      <div className="landing-chart-head">
        <div>
          <span>PROTOCOL EXAMPLE</span>
          <strong>Basket funding</strong>
        </div>
        <span className="landing-chart-state"><i /> Reveal ready</span>
      </div>

      <div className="landing-chart-basket">
        <div className="landing-chart-logos" aria-hidden="true">
          <CompanyLogo symbol="NVDA" name="NVIDIA" />
          <CompanyLogo symbol="AAPL" name="Apple" />
          <CompanyLogo symbol="OPENAI" name="OpenAI" />
        </div>
        <div><strong>NVDA · AAPL · OPENAI</strong><span>3-token target</span></div>
        <b>100%</b>
      </div>

      <div className="landing-chart-plot">
        <LineChart
          animationDuration={900}
          aspectRatio="16 / 7"
          data={fundingCurve}
          margin={{ top: 18, right: 14, bottom: 12, left: 14 }}
        >
          <Grid horizontal numTicksRows={4} strokeDasharray="2,6" />
          <Line
            dataKey="funded"
            fadeEdges={false}
            showMarkers
            stroke="var(--lime)"
            strokeWidth={2.5}
          />
          <ChartTooltip
            backgroundColor="rgba(15,13,18,.96)"
            dotColor="var(--lime)"
            dotVariant="ring"
            indicatorColor="var(--leaf)"
            rows={(point) => [{ color: "var(--lime)", label: "Vault funded", value: `${point.funded}%` }]}
            showDatePill={false}
          />
        </LineChart>
        <div className="landing-chart-axis" aria-hidden="true"><span>FUND</span><span>CLOSE</span><span>REVEAL</span></div>
      </div>

      <div className="landing-chart-facts">
        <div><span>Claim floor</span><strong>&gt;0</strong></div>
        <div><span>Distribution</span><strong>100%</strong></div>
        <div><span>Art source</span><strong>Position DNA</strong></div>
      </div>
    </div>
  );
}

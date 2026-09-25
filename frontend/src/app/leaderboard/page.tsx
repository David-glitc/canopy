export const metadata = {
  title: "Leaderboard",
  description: "Time-weighted price rules. Silence keeps the status quo.",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
        05 / LEADERBOARD
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        The time-weighted price rules.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
        Silence keeps the status quo. Active proposers and decisive voters
        climb the board. Rankings reflect realized market impact, not raw
        capital.
      </p>
      <div className="mt-10 rounded-2xl border border-[var(--canopy-line)] bg-black/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--canopy-line)]">
              <th className="px-4 py-3 font-mono2 text-left text-[var(--canopy-muted)]">#</th>
              <th className="px-4 py-3 font-mono2 text-left text-[var(--canopy-muted)]">ADDRESS</th>
              <th className="px-4 py-3 font-mono2 text-left text-[var(--canopy-muted)]">ROLE</th>
              <th className="px-4 py-3 font-mono2 text-left text-[var(--canopy-muted)]">MARKETS</th>
              <th className="px-4 py-3 font-mono2 text-left text-[var(--canopy-muted)]">P&L</th>
            </tr>
          </thead>
          <tbody>
            {[
              { addr: "0x1a2b…", role: "Governor", markets: 8, pnl: "+240%" },
              { addr: "0x3c4d…", role: "Proposer", markets: 5, pnl: "+180%" },
              { addr: "0x5e6f…", role: "Voter", markets: 12, pnl: "+95%" },
              { addr: "0x7g8h…", role: "Holder", markets: 2, pnl: "+12%" },
            ].map((r, i) => (
              <tr key={r.addr} className="border-b border-[var(--canopy-line)] last:border-0 hover:bg-[rgba(20,241,149,0.05)]">
                <td className="px-4 py-3 font-mono2 text-[var(--canopy-muted)] tabular">{i + 1}</td>
                <td className="px-4 py-3 font-mono2 text-[var(--canopy-text)] tabular">{r.addr}</td>
                <td className="px-4 py-3 font-mono2 text-[var(--canopy-green)]">{r.role}</td>
                <td className="px-4 py-3 font-mono2 text-[var(--canopy-muted)] tabular">{r.markets}</td>
                <td className="px-4 py-3 font-mono2 text-[var(--canopy-green)] tabular">{r.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-center font-mono2 text-sm text-[var(--canopy-muted)]">
          Live rankings populate as futarchy markets activate on devnet.
        </div>
      </div>
    </div>
  );
}

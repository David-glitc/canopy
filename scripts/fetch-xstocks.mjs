// Fill packages/registry/mainnet.json from the Backed public assets API.
// No auth required. Run: node fetch-xstocks.mjs > ../packages/registry/mainnet.json
const res = await fetch("https://api.backed.fi/api/v2/public/assets", {
  headers: { "Content-Type": "application/json" },
});
if (!res.ok) throw new Error(`backed api ${res.status}`);
const data = await res.json();
const out = { network: "mainnet-beta", assets: [] };
for (const n of data.nodes ?? []) {
  const sol = (n.deployments ?? []).find((d) => d.network === "solana");
  if (!sol) continue;
  out.assets.push({
    symbol: n.symbol,
    underlying: n.underlyingSymbol,
    name: n.name,
    mint: sol.address,
    decimals: sol.decimals,
    isTradingHalted: n.isTradingHalted,
  });
}
console.log(JSON.stringify(out, null, 2));
console.error(`wrote ${out.assets.length} solana assets`);

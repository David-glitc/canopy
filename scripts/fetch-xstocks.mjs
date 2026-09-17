// Fill packages/registry/mainnet.json from the Backed public assets API.
// No auth required. Paginates all pages; matches Solana case-insensitively.
// Run: node fetch-xstocks.mjs > /tmp/xstocks.json
const out = { network: "mainnet-beta", assets: [] };
let page = 0;
for (;;) {
  const res = await fetch(`https://api.backed.fi/api/v2/public/assets?page=${page}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`backed api ${res.status}`);
  const data = await res.json();
  for (const n of data.nodes ?? []) {
    const sol = (n.deployments ?? []).find(
      (d) => String(d.network ?? "").toLowerCase() === "solana"
    );
    if (!sol) continue;
    out.assets.push({
      symbol: n.symbol,
      underlying: n.underlyingSymbol,
      name: n.name,
      mint: sol.address,
      atomic: !!sol.supportsAtomicSwaps,
      isTradingHalted: n.isTradingHalted,
    });
  }
  if (!data.page?.hasNextPage) break;
  page = (data.page?.currentPage ?? page) + 1;
}
console.log(JSON.stringify(out, null, 2));
console.error(`wrote ${out.assets.length} solana assets`);

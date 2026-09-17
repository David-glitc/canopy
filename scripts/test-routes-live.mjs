// Live-test app metadata/image routes against real devnet Shares.
// Discovers ShareRecords, classifies instant (dna attr) vs pool, hits routes.
import { Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey as umiPk } from "@metaplex-foundation/umi";

const CANOPY = new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");
const RPC = "https://api.devnet.solana.com";
const APP = "http://localhost:3100";
const assert = (c, l) => { console.log(c ? `PASS ${l}` : `FAIL ${l}`); if (!c) process.exitCode = 1; };

// record: disc8 grove32 owner32 deposit8 asset32 index4 revealed1 weight8 status1 bump1
function parseRec(d) {
  return {
    grove: new PublicKey(d.subarray(8, 40)).toBase58(),
    core: new PublicKey(d.subarray(80, 112)).toBase58(),
    index: d.readUInt32LE(112),
    revealed: d[116] === 1,
    weight: d.readBigUInt64LE(117),
    status: d[125],
  };
}

const connection = new Connection(RPC, "confirmed");
const accts = await connection.getProgramAccounts(CANOPY, { filters: [{ dataSize: 127 }] });
const recs = [];
for (const { account } of accts) {
  const r = parseRec(account.data);
  if (r.revealed && r.status === 0) recs.push(r);
}
console.log(`found ${recs.length} revealed active Shares`);

const umi = createUmi(RPC);
let testedInstant = false, testedPool = false;
for (const r of recs.slice(0, 6)) {
  let dna = null;
  try {
    const a = await fetchAsset(umi, umiPk(r.core));
    dna = (a.attributes?.attributeList ?? []).find((x) => x.key === "dna")?.value ?? null;
  } catch { continue; }
  const isInstant = !!dna;
  if (isInstant && testedInstant) continue;
  if (!isInstant && testedPool) continue;
  const qs = isInstant ? "" : `?grove=${r.grove}&index=${r.index}`;
  const meta = await (await fetch(`${APP}/api/cards/${r.core}/metadata${qs}`)).json();
  assert(meta.name && meta.attributes?.length > 0, `${isInstant ? "instant" : "pool"} metadata (${r.core.slice(0, 8)}…)`);
  assert(!!meta.image, `${isInstant ? "instant" : "pool"} metadata has image`);
  const img = await fetch(`${APP}/api/cards/${r.core}/image${qs}`);
  const buf = Buffer.from(await img.arrayBuffer());
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  assert(img.headers.get("content-type") === "image/png" && isPng && buf.length > 20000, `${isInstant ? "instant" : "pool"} image PNG (${(buf.length / 1024).toFixed(0)}KB)`);
  if (isInstant) testedInstant = true; else testedPool = true;
  if (testedInstant && testedPool) break;
}
assert(testedInstant, "instant path exercised");
assert(testedPool, "pool path exercised");
console.log("route test complete");

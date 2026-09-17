// Read-only futarchy market views (trading UI lands next).
import { PublicKey } from "@solana/web3.js";

export const FUTARCHY_ID = new PublicKey("BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k");

export type MarketData = {
  address: string;
  grove: string;
  proposalId: bigint;
  opensAt: bigint;
  closesAt: bigint;
  decided: boolean;
  passed: boolean;
  passReserve: bigint;
  failReserve: bigint;
  tradeCount: bigint;
};

// Market layout: disc8 grove32 pid8 cmint32 vault32 pmint32 fmint32 ppool32
// fpool32 opens8 closes8 decided1 passed1 pres8 fres8 cum16 crank8 trades8 bump1
export function parseMarket(address: string, data: Uint8Array): MarketData {
  const pk = (o: number) => new PublicKey(data.subarray(o, o + 32)).toBase58();
  const u64at = (o: number) =>
    new DataView(data.buffer, data.byteOffset + o, 8).getBigUint64(0, true);
  const i64at = (o: number) =>
    new DataView(data.buffer, data.byteOffset + o, 8).getBigInt64(0, true);
  const o = 8 + 32 + 8 + 32 * 6;
  return {
    address,
    grove: pk(8),
    proposalId: u64at(40),
    opensAt: i64at(o),
    closesAt: i64at(o + 8),
    decided: data[o + 16] === 1,
    passed: data[o + 17] === 1,
    passReserve: u64at(o + 18),
    failReserve: u64at(o + 26),
    tradeCount: u64at(o + 50),
  };
}

export function marketPrice(m: MarketData): number {
  if (m.passReserve === 0n) return 0;
  return Number((m.failReserve * 1_000_000_000n) / m.passReserve) / 1e9;
}

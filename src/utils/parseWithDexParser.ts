// src/utils/parseWithDexParser.ts

import { DexParser } from 'solana-dex-parser/src/dex-parser';
import { getFinalSwap } from 'solana-dex-parser/src/utils';
import { SolanaTransaction, TradeInfo } from 'solana-dex-parser/src/types/trade';
import { DEX_PROGRAMS } from 'solana-dex-parser/src/constants/programId';

/**
 * Extract all parsed trades using the DexParser.
 */
export function extractTradesFromParsed(tx: SolanaTransaction): TradeInfo[] {
  try {
    const parser = new DexParser();
    const { trades } = parser.parseAll(tx, { tryUnknowDEX: false });

    // Deduplicate trades
    const uniqueTrades = Array.from(
      new Map(trades.map((t) => [`${t.signature}-${t.idx}`, t])).values()
    );

    return uniqueTrades;
  } catch (err) {
    console.error('❌ Error in extractTradesFromParsed:', err);
    return [];
  }
}

/**
 * Extracts the final trade from a parsed transaction using DexParser and getFinalSwap.
 */
export function extractTradeFromParsed(tx: SolanaTransaction): {
  inToken: any;
  outToken: any;
  project: string;
  bondingCurve?: string;
} | null {
  const trades = extractTradesFromParsed(tx);
  const final = getFinalSwap(trades);
  if (!final) {
    console.warn('⚠️ No final trade extracted from getFinalSwap');
    return null;
  }

  if (!final.programId) {
    console.warn('⚠️ Missing programId in final trade. Skipping this trade.');
    return null;
  }

  const match = Object.entries(DEX_PROGRAMS).find(
    ([_, dex]) => dex.id === final.programId
  );

  if (!match) {
    console.warn(`⚠️ Could not detect DEX for programId: ${final.programId}`);
    return null;
  }

  return {
    inToken: final.inputToken,
    outToken: final.outputToken,
    project: match[0], // DEX name like 'RAYDIUM_V4', 'PUMP_FUN', etc.
    bondingCurve: match[0] === 'PUMP_FUN' ? extractBondingCurve(final) : undefined,
  };
}

/**
 * Optional: helper for extracting bonding curve from finalSwap
 */
function extractBondingCurve(trade: any): string | undefined {
  return trade?.bondingCurve || undefined;
}


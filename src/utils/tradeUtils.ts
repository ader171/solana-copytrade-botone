import { getTokenPrice } from "../config/index"; // Adjust the path if needed

/**
 * Converts an on-chain amount (lamports) to USD value using the token's current price.
 * Assumes that 1 SOL = 1e9 lamports.
 */
export async function getTradeUSDValue(tradeData: { amount_in: number; token_in: string; }): Promise<number> {
  const solAmount = tradeData.amount_in / 1e9;
  const tokenPriceUSD = await getTokenPrice(tradeData.token_in);
  return solAmount * tokenPriceUSD;
}

/**
 * Determines your trade amount based on a fixed $10 strategy.
 * Converts $10 worth of token_in into lamports.
 */
export async function computeMyTradeAmount(tradeData: { amount_in: number; token_in: string; }): Promise<number> {
  const FIXED_TRADE_USD = 20;
  const tokenPriceUSD = await getTokenPrice(tradeData.token_in);
  const mySolAmount = FIXED_TRADE_USD / tokenPriceUSD;
  const myLamports = Math.floor(mySolAmount * 1e9);
  return myLamports;
}


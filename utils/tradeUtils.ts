import { getTokenPrice } from "../index"; // Adjust the path if needed
import { getWalletValue } from "../someWalletModule"; // If you have a function for that

/**
 * Converts an on-chain amount (lamports) to USD value using the token's current price.
 * Assumes that 1 SOL = 1e9 lamports.
 */
export async function getTradeUSDValue(tradeData: { amount_in: number; token_in: string; }): Promise<number> {
  // Convert lamports to SOL (if token_in is SOL). If it's another token, adjust using the token's decimals.
  const solAmount = tradeData.amount_in / 1e9;
  
  // Fetch the current USD price of the token
  const tokenPriceUSD = await getTokenPrice(tradeData.token_in);
  
  // Calculate the USD value of the trade
  return solAmount * tokenPriceUSD;
}

/**
 * Determines your trade amount based on the target trade's USD value.
 * - If the target trade's value is <= $300, you trade $10.
 * - If it is > $300, you trade $20.
 * Returns the amount in lamports (if trading SOL).
 */
export async function computeMyTradeAmount(tradeData: { amount_in: number; token_in: string; }): Promise<number> {
  // First, calculate the USD value of the target trade
  const tradeUSD = await getTradeUSDValue(tradeData);
  
  // Decide the trade amount in USD based on the target's trade size
  const myTradeUSD = tradeUSD <= 300 ? 10 : 20;
  
  // Fetch the token price again (or cache it) to convert USD back to lamports
  const tokenPriceUSD = await getTokenPrice(tradeData.token_in);
  
  // Convert your USD amount into SOL, then lamports
  const mySolAmount = myTradeUSD / tokenPriceUSD;
  const myLamports = Math.floor(mySolAmount * 1e9);
  
  return myLamports;
}


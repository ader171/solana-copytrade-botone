export function estimateUSDFromSolDelta(preBalances: number[], postBalances: number[], pricePerSOL: number): number {
  const solDelta = preBalances[0] - postBalances[0]; // in lamports
  const solSpent = solDelta / 1e9;
  return solSpent * pricePerSOL;
}


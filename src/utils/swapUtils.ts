// src/utils/swapUtils.ts
import { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import Jupiter from "@jup-ag/api";
const userWallet = process.env.YOUR_WALLET_ADDRESS!;

export async function executeJupiterSwap(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  const jupiter = new Jupiter({
    connection: new Connection("https://api.mainnet-beta.solana.com"),
    cluster: "mainnet-beta"
  });

  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    amount,
    slippageBps: 100
  });

  if (!routes.bestRoute) throw new Error("No route found");
  
  const { swapTransaction } = await jupiter.exchange({
    route: routes.bestRoute,
    userPublicKey: new PublicKey("userWallet"),
    wrapUnwrapSOL: true
  });

  return swapTransaction;
}

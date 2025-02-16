// main.ts
import dotenv from "dotenv";
dotenv.config();
import { Jupiter, RouteInfo } from "@jup-ag/api";
import { RPC_ENDPOINT, TARGET_WALLET } from "./constants";
import { Connection, VersionedTransaction, Keypair, PublicKey, Commitment } from "@solana/web3.js";
import WebSocket from "ws";
import axios from "axios";
import { computeMyTradeAmount } from "./utils/tradeUtils";
import bs58 from "bs58";
import { sendTelegramNotification } from "./telegramconvo";

// -----------------------------
// Initialize Core Components
// -----------------------------
const connection = new Connection(RPC_ENDPOINT, {
  commitment: "confirmed" as Commitment,
  wsEndpoint: process.env.RPC_WEBSOCKET_ENDPOINT
});

const keyPair = Keypair.fromSecretKey(
  bs58.decode(process.env.PRIVATE_KEY as string)
);

const jupiter = new Jupiter({
  connection,
  cluster: "mainnet-beta",
});

// -----------------------------
// Enhanced Jupiter Swap Execution
// -----------------------------
async function executeJupiterSwap(
  inputToken: string,
  outputToken: string,
  amountLamports: number
): Promise<string> {
  try {
    // 1. Get best route
    const { bestRoute } = await jupiter.computeRoutes({
      inputMint: new PublicKey(inputToken),
      outputMint: new PublicKey(outputToken),
      amount: amountLamports,
      slippageBps: 100, // 1% slippage
      onlyDirectRoutes: false
    });

    if (!bestRoute) throw new Error("No viable swap route found");

    // 2. Prepare swap transaction
    const { swapTransaction } = await jupiter.exchange({
      route: bestRoute,
      userPublicKey: keyPair.publicKey,
      wrapUnwrapSOL: true
    });

    // 3. Sign and execute
    const signedTx = await swapTransaction.sign([keyPair]);
    const rawTransaction = signedTx.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction);
    
    // 4. Confirm transaction
    await connection.confirmTransaction(txid);
    return txid;

  } catch (error) {
    console.error("Swap execution failed:", error);
    throw error;
  }
}

// -----------------------------
// WebSocket Trade Detection
// -----------------------------
const ws = new WebSocket(process.env.RPC_WEBSOCKET_ENDPOINT!);

ws.on("open", () => {
  console.log("Monitoring wallet:", TARGET_WALLET);
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "accountSubscribe",
    params: [
      TARGET_WALLET,
      { encoding: "jsonParsed", commitment: "confirmed" }
    ]
  }));
});

ws.on("message", async (data: WebSocket.Data) => {
  try {
    const rawData = data.toString();
    const parsed = JSON.parse(rawData);
    
    // 1. Filter for successful transactions
    const txData = parsed?.params?.result?.value;
    if (!txData || txData.err) return;

    // 2. Detect Jupiter swaps
    const isJupiterSwap = txData.transaction.message.instructions
      .some((ix: any) => ix.programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4');

    if (!isJupiterSwap) return;

    // 3. Extract swap details
    const preTokenBalances = txData.meta.preTokenBalances;
    const postTokenBalances = txData.meta.postTokenBalances;

    const inputBalance = preTokenBalances.find((b: any) => 
      b.owner === TARGET_WALLET && b.mint !== b.uiTokenAmount.tokenSymbol
    );
    const outputBalance = postTokenBalances.find((b: any) =>
      b.owner === TARGET_WALLET && b.mint !== inputBalance?.mint
    );

    if (!inputBalance || !outputBalance) {
      throw new Error("Failed to detect swap tokens");
    }

    // 4. Calculate copy trade amount
    const myAmount = await computeMyTradeAmount({
      amount_in: inputBalance.uiTokenAmount.uiAmount,
      token_in: inputBalance.mint
    });

    // 5. Execute copy trade
    const txSig = await executeJupiterSwap(
      inputBalance.mint,
      outputBalance.mint,
      myAmount
    );

    await sendTelegramNotification(
      `✅ Copied trade executed: https://solscan.io/tx/${txSig}\n` +
      `Swapped ${inputBalance.uiTokenAmount.uiAmount} ${inputBalance.uiTokenAmount.tokenSymbol} ` +
      `for ${outputBalance.uiTokenAmount.uiAmount} ${outputBalance.uiTokenAmount.tokenSymbol}`
    );

  } catch (error) {
    console.error("Trade copy failed:", error);
    await sendTelegramNotification(`❌ Trade failed: ${error.message}`);
  }
});

// -----------------------------
// Startup Validation
// -----------------------------
console.log("🚀 Bot started with configuration:");
console.log("- RPC Endpoint:", RPC_ENDPOINT);
console.log("- Target Wallet:", TARGET_WALLET);
console.log("- Trading Wallet:", keyPair.publicKey.toBase58());

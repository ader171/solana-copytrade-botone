// main.ts

import { Connection, VersionedTransaction, Keypair } from "@solana/web3.js";
import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";
import { execute } from "./utils/legacy";
import { computeMyTradeAmount } from "./utils/tradeUtils";
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT, TARGET_WALLET, SLIPPAGE } from "./constants";
import base58 from "base58";

dotenv.config();

// Create a Solana connection using the RPC endpoint.
const connection = new Connection(RPC_ENDPOINT);

// Create a WebSocket connection using the WebSocket endpoint.
const ws = new WebSocket(RPC_WEBSOCKET_ENDPOINT);

// Load your keypair from your PRIVATE_KEY environment variable.
const keyPair = Keypair.fromSecretKey(
  Buffer.from(require("base58").decode(process.env.PRIVATE_KEY as string))
);

// -----------------------------
// Build Trade Transaction Using Jupiter Aggregator API
// -----------------------------
/**
 * Builds a swap transaction using Jupiter aggregator.
 *
 * @param myTradeLamports - The computed trade amount in lamports.
 * @param inputToken - The input token address (from tradeData, typically SOL).
 * @param outputToken - The output token address (dynamically extracted from trade data).
 * @returns A signed VersionedTransaction ready for execution.
 */
async function buildTradeTransaction(
  myTradeLamports: number,
  inputToken: string,
  outputToken: string
): Promise<VersionedTransaction> {
  // Construct the quote API URL using dynamic parameters.
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${myTradeLamports}&slippage=${SLIPPAGE}`;
  
  const quoteResponse = await axios.get(quoteUrl);
  if (!quoteResponse.data || !quoteResponse.data.data || quoteResponse.data.data.length === 0) {
    throw new Error("No valid quote available from Jupiter.");
  }
  
  // Select the best route; here, we choose the first route.
  const bestRoute = quoteResponse.data.data[0];
  
  // Construct the payload for the swap endpoint.
  const swapUrl = `https://quote-api.jup.ag/v6/swap`;
  const swapPayload = {
    quoteResponse: bestRoute,
    userPublicKey: keyPair.publicKey.toBase58(),
    wrapUnwrapSOL: true
  };
  
  const swapResponse = await axios.post(swapUrl, swapPayload);
  if (!swapResponse.data || !swapResponse.data.swapTransaction) {
    throw new Error("Failed to build swap transaction via Jupiter.");
  }
  
  // The swap transaction is returned as a base64-encoded string.
  const swapTxBase64 = swapResponse.data.swapTransaction;
  const txBytes = Buffer.from(swapTxBase64, "base64");
  
  // Deserialize the transaction as a VersionedTransaction.
  const transaction = VersionedTransaction.deserialize(txBytes);
  
  // Sign the transaction.
  transaction.sign([keyPair]);
  
  return transaction;
}

// -----------------------------
// Main Integration Flow
// -----------------------------
/**
 * The bot listens to real-time trade data via the WebSocket.
 * When a message with valid trade data is received (including amount_in, token_in, token_out),
 * it calculates your trade amount using computeMyTradeAmount, builds a swap transaction via Jupiter,
 * and executes the transaction on the Solana blockchain.
 */
ws.on("open", () => {
  console.log("WebSocket connection opened. Listening for trades from target wallet:", TARGET_WALLET);
});

ws.on("message", async (data: any) => {
  try {
    // Convert the incoming data to a UTF-8 string.
    const messageStr = data.toString("utf8");
    console.log("Received WebSocket message:", messageStr);
    
    // Parse the message as JSON.
    const tradeData = JSON.parse(messageStr);
    
    // Check for required trade fields.
    if (tradeData && tradeData.amount_in && tradeData.token_in && tradeData.token_out) {
      console.log("Detected trade data:", tradeData);
      
      // Compute your trade amount (in lamports) based on the target trade's USD value.
      const myTradeLamports = await computeMyTradeAmount({
        amount_in: tradeData.amount_in,
        token_in: tradeData.token_in,
      });
      console.log(`Computed trade amount: ${myTradeLamports} lamports`);
      
      // Build the trade transaction using the dynamic input token and output token from tradeData.
      const transaction = await buildTradeTransaction(myTradeLamports, tradeData.token_in, tradeData.token_out);
      
      // Retrieve the latest blockhash required for transaction confirmation.
      const latestBlockhash = await connection.getLatestBlockhash();
      
      // Execute the transaction using the legacy execute function.
      const signature = await execute(
        transaction,
        {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        true  // 'true' indicates a buy trade; adjust if needed.
      );
      
      if (signature) {
        console.log(`Trade executed successfully! View at: https://solscan.io/tx/${signature}`);
      } else {
        console.log("Trade execution failed.");
      }
    } else {
      console.log("Received message does not contain valid trade data.");
    }
  } catch (err) {
    console.error("Error processing WebSocket message:", err);
  }
});

console.log(`Listening for trade data on target wallet: ${TARGET_WALLET}...`);


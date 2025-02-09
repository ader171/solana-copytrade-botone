// main.ts

import { Connection, VersionedTransaction, Keypair, PublicKey } from "@solana/web3.js"; // <-- ADDED PublicKey
import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";
import { execute } from "./utils/legacy";
import { computeMyTradeAmount } from "./utils/tradeUtils";
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT, TARGET_WALLET, SLIPPAGE } from "./constants";
import base58 from "base58";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"; // <-- ADDED

dotenv.config();

// -----------------------------
// Telegram Notification Function
// -----------------------------
async function sendTelegramNotification(message: string): Promise<void> {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Telegram token or chat ID not defined in .env");
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, { chat_id: chatId, text: message });
    console.log("Telegram notification sent:", message);
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

// -----------------------------
// Build Trade Transaction Using Jupiter Aggregator API
// -----------------------------
/**
 * Builds a swap transaction using the Jupiter aggregator.
 *
 * @param myTradeLamports - The computed trade amount in lamports.
 * @param inputToken - The input token address (from trade data, e.g. SOL).
 * @param outputToken - The output token address (extracted dynamically).
 * @returns A signed VersionedTransaction ready for execution.
 */
async function buildTradeTransaction(
  myTradeLamports: number,
  inputToken: string,
  outputToken: string
): Promise<VersionedTransaction> {
  // Construct the quote API URL with dynamic parameters.
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${myTradeLamports}&slippage=${SLIPPAGE}`;
  
  const quoteResponse = await axios.get(quoteUrl);
  if (!quoteResponse.data || !quoteResponse.data.data || quoteResponse.data.data.length === 0) {
    throw new Error("No valid quote available from Jupiter.");
  }
  
  // Choose the best route (for simplicity, select the first route).
  const bestRoute = quoteResponse.data.data[0];
  
  // Prepare the payload for the swap endpoint.
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
  
  // Deserialize and sign the transaction.
  const transaction = VersionedTransaction.deserialize(txBytes);
  transaction.sign([keyPair]);
  
  return transaction;
}

// -----------------------------
// Load Keypair and Create Connection
// -----------------------------
const connection = new Connection(RPC_ENDPOINT);
const keyPair = Keypair.fromSecretKey(
  Buffer.from(require("base58").decode(process.env.PRIVATE_KEY as string))
);

// -----------------------------
// WebSocket Trade Detection & Main Flow
// -----------------------------
const ws = new WebSocket(RPC_WEBSOCKET_ENDPOINT);

ws.on("open", async () => { // <-- Changed to async
  console.log("WebSocket connection opened. Listening for trades from target wallet:", TARGET_WALLET);

  // -- EXAMPLE: Minimal call to get the token accounts of a wallet (replace if needed).
  try {
    const walletPubKey = new PublicKey("o1pR5opoykWbDiuoqw5X2kKkcrSk3JhMjFEC2edpnzZ"); // Or any other public key
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    console.log("Token accounts found for this wallet:", tokenAccounts.value);
  } catch (error) {
    console.error("Error fetching token accounts:", error);
  }
});

ws.on("message", async (data: any) => {
  try {
    const messageStr = data.toString("utf8");
    console.log("Received WebSocket message:", messageStr);
    
    // Parse the incoming message as JSON.
    const tradeData = JSON.parse(messageStr);
    
    // Validate that the message contains necessary trade details.
    if (tradeData && tradeData.amount_in && tradeData.token_in && tradeData.token_out) {
      // Determine trade type; if a field "trade_type" exists, use it; otherwise, default to buy.
      const isBuy = tradeData.trade_type && tradeData.trade_type.toLowerCase() === "sell" ? false : true;
      
      // Notify that a new trade has been detected.
      await sendTelegramNotification(
        `New ${isBuy ? "buy" : "sell"} trade detected from target wallet: ${tradeData.token_in} -> ${tradeData.token_out}, amount_in: ${tradeData.amount_in} lamports.`
      );
      
      // Compute your desired trade amount based on the target trade's USD value.
      const myTradeLamports = await computeMyTradeAmount({
        amount_in: tradeData.amount_in,
        token_in: tradeData.token_in,
      });
      console.log(`Computed trade amount for execution: ${myTradeLamports} lamports`);
      
      // Build the trade transaction using the computed amount and the dynamic token addresses.
      const transaction = await buildTradeTransaction(myTradeLamports, tradeData.token_in, tradeData.token_out);
      
      // Retrieve the latest blockhash information.
      const latestBlockhash = await connection.getLatestBlockhash();
      
      // Execute the transaction.
      const signature = await execute(
        transaction,
        {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        isBuy  // Pass trade type to the execution function.
      );
      
      if (signature) {
        const successMsg = `Trade executed successfully! Transaction signature: ${signature}. View at https://solscan.io/tx/${signature}`;
        console.log(successMsg);
        await sendTelegramNotification(successMsg);
      } else {
        const failureMsg = "Trade execution failed.";
        console.log(failureMsg);
        await sendTelegramNotification(failureMsg);
      }
    } else {
      console.log("Received message does not contain valid trade data.");
    }
  } catch (err) {
    console.error("Error processing WebSocket message:", err);
    await sendTelegramNotification(`Error processing trade data: ${err}`);
  }
});

console.log(`Listening for trade data on target wallet: ${TARGET_WALLET}...`);


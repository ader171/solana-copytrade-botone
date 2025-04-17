import dotenv from "dotenv";
dotenv.config();
import {
  Connection,
  ParsedTransactionWithMeta,
  PublicKey,
  VersionedTransaction,
  Keypair,
  Finality,
  ParsedInstruction
} from "@solana/web3.js";
import { decodeSwapInstruction } from "./utils/decodeSwapInstruction";
import { computeMyTradeAmount } from "./utils/tradeUtils";
import { sendTelegramNotification } from "./telegramconvo";
import { RPC_ENDPOINT, TARGET_WALLET } from "./constants";
import bs58 from "bs58";

const connection = new Connection(RPC_ENDPOINT, "confirmed" as Finality);
const keyPair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));
const seenSignatures = new Set<string>();

async function executeJupiterSwap(inputToken: string, outputToken: string, amountLamports: number): Promise<string> {
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amountLamports}&slippageBps=100`;
  const quoteResp = await fetch(quoteUrl);
  const quoteData = await quoteResp.json();
  const route = quoteData.data?.[0];
  if (!route) throw new Error("No route found");

  const swapResp = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: route,
      userPublicKey: keyPair.publicKey.toBase58(),
      wrapUnwrapSOL: true
    })
  });
  const swapData = await swapResp.json();
  const txBuf = Buffer.from(swapData.swapTransaction, "base64");
  const tx = VersionedTransaction.deserialize(txBuf);
  tx.sign([keyPair]);
  const sig = await connection.sendTransaction(tx);
  await connection.confirmTransaction(sig);
  return sig;
}

async function pollTransactions() {
  console.log("🔁 Polling for target wallet transactions...");

  try {
    const sigs = await connection.getSignaturesForAddress(new PublicKey(TARGET_WALLET), { limit: 10 });

    for (const sig of sigs) {
      if (seenSignatures.has(sig.signature)) continue;
      seenSignatures.add(sig.signature);

      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      });

      if (!tx || !tx.meta || tx.meta.err) continue;

      console.log("Transaction Instructions:", tx.transaction.message.instructions);

      const decoded = await decodeSwapInstruction(tx as ParsedTransactionWithMeta);

      if (!decoded) continue;

      const { inputToken, outputToken, amountIn } = decoded;
      const amountInOrDefault = amountIn ?? 1e9;

      const myAmountLamports = await computeMyTradeAmount({
        amount_in: amountInOrDefault,
        token_in: inputToken
      });

      const txSig = await executeJupiterSwap(inputToken, outputToken, myAmountLamports);

      await sendTelegramNotification(
        `✅ Copied trade executed: https://solscan.io/tx/${txSig}\n` +
        `Swapped ${inputToken} → ${outputToken} (~$10 USD equivalent)`
      );
    }
  } catch (err) {
    console.error("Polling error:", err);
    await sendTelegramNotification(`❌ Polling error: ${err instanceof Error ? err.message : err}`);
  }

  setTimeout(pollTransactions, 2000);
}

console.log("🚀 Bot started with configuration:");
console.log("- RPC Endpoint:", RPC_ENDPOINT);
console.log("- Target Wallet:", TARGET_WALLET);
console.log("- Trading Wallet:", keyPair.publicKey.toBase58());

pollTransactions();


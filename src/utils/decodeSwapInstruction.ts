import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export interface DecodedSwap {
  inputToken: string;
  outputToken: string;
}

function detectTokenSwapFromTransfer(tx: ParsedTransactionWithMeta): DecodedSwap | null {
  if (!tx.meta || !tx.meta.preTokenBalances || !tx.meta.postTokenBalances) return null;

  const pre = tx.meta.preTokenBalances;
  const post = tx.meta.postTokenBalances;

  if (pre.length === 0 || post.length === 0) return null;

  // Look for balances where amount drops in pre, and increases in post
  for (const preBal of pre) {
    const postBal = post.find(p => p.mint === preBal.mint && p.owner === preBal.owner);
    if (!postBal) continue;

    const amountPre = parseFloat(preBal.uiTokenAmount.uiAmountString || "0");
    const amountPost = parseFloat(postBal.uiTokenAmount.uiAmountString || "0");

    if (amountPre > amountPost) {
      // Spent this token (input)
      const inputToken = preBal.mint;

      const gain = post.find(
        p =>
          p.mint !== preBal.mint &&
          p.owner === preBal.owner &&
          parseFloat(p.uiTokenAmount.uiAmountString || "0") >
            parseFloat(
              pre.find(q => q.mint === p.mint && q.owner === p.owner)?.uiTokenAmount.uiAmountString || "0"
            )
      );

      if (gain) {
        return {
          inputToken,
          outputToken: gain.mint,
        };
      }
    }
  }

  return null;
}

function decodePumpFunSwap(tx: ParsedTransactionWithMeta): DecodedSwap | null {
  const pumpIx = tx.transaction.message.instructions.find((ix) => {
    return (
      "data" in ix &&
      ix.data &&
      tx.meta?.innerInstructions?.some((inner) =>
        inner.instructions.some(
          (ix) =>
            "parsed" in ix &&
            ix.program === "system" &&
            ix.parsed?.type === "transfer"
        )
      )
    );
  });

  const mintAccount = tx.transaction.message.accountKeys[2]?.pubkey;
  if (!pumpIx || !mintAccount) return null;

  return {
    inputToken: "So11111111111111111111111111111111111111112", // Native SOL
    outputToken: mintAccount.toBase58(),
  };
}

export async function decodeSwapInstruction(
  tx: ParsedTransactionWithMeta
): Promise<DecodedSwap | null> {
  try {
    const jupiterSwap = detectTokenSwapFromTransfer(tx);
    if (jupiterSwap) return jupiterSwap;

    const pumpFunSwap = decodePumpFunSwap(tx);
    if (pumpFunSwap) return pumpFunSwap;

    return null;
  } catch (error) {
    console.error("❌ Swap decoding failed:", error);
    return null;
  }
}


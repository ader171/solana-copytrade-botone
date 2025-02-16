import { PublicKey } from "@solana/web3.js";
// Import SDKs
import { parseSwapInstruction as parseJupiterSwap } from "@jup-ag/core";
import { WhirlpoolIx } from "@orca-so/whirlpool-sdk";
import { StableSwap } from "@saberhq/stable-swap-sdk";
import { RaydiumSwapDecoder } from "@raydium-io/raydium-sdk";
import { SerumSwapDecoder } from "@project-serum/serum";

export interface DecodedSwap {
  inputToken: string;
  outputToken: string;
  amountIn: number;
}

export function decodeSwapInstruction(ix: any): DecodedSwap {
  const programId = ix.programId.toBase58();

  // 1. Jupiter Swap
  if (programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4') {
    const jupiterSwap = parseJupiterSwap(ix);
    return {
      inputToken: jupiterSwap.inputMint.toBase58(),
      outputToken: jupiterSwap.outputMint.toBase58(),
      amountIn: jupiterSwap.amountIn,
    };
  }

  // 2. Orca Whirlpool
  if (programId === '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdap3mQ') {
    const orcaSwap = WhirlpoolIx.decodeSwap(ix.data);
    return {
      inputToken: ix.accounts[orcaSwap.inputTokenAccountIndex].toBase58(),
      outputToken: ix.accounts[orcaSwap.outputTokenAccountIndex].toBase58(),
      amountIn: Number(orcaSwap.amount),
    };
  }

  // 3. Pump.fun (No SDK - Manual Parsing)
  if (programId === '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ35MKYgHq5Upm') {
    return {
      inputToken: 'So11111111111111111111111111111111111111112', // SOL
      outputToken: ix.accounts[2].toBase58(),
      amountIn: Number(ix.data.readBigUInt64LE(8)), // Lamports
    };
  }

  // 4. Saber Stable Swap
  if (programId === 'SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ') {
    const saberSwap = StableSwap.decodeSwapInstruction(ix);
    return {
      inputToken: saberSwap.sourceToken.toBase58(),
      outputToken: saberSwap.destinationToken.toBase58(),
      amountIn: Number(saberSwap.amountIn),
    };
  }

  // 5. Raydium
  if (programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp') {
    const raydiumSwap = RaydiumSwapDecoder.decode(ix.data);
    return {
      inputToken: raydiumSwap.inputMint.toBase58(),
      outputToken: raydiumSwap.outputMint.toBase58(),
      amountIn: Number(raydiumSwap.amountIn),
    };
  }

  // 6. Serum (Legacy)
  if (programId === '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin') {
    const serumSwap = SerumSwapDecoder.decode(ix.data);
    return {
      inputToken: serumSwap.inMint.toBase58(),
      outputToken: serumSwap.outMint.toBase58(),
      amountIn: Number(serumSwap.amountIn),
    };
  }

  throw new Error(`Unsupported DEX: ${programId}`);
}

// src/monitoring/walletStream.ts

import { GrpcProvider } from 'solana-parse-execute';
import { PublicKey } from '@solana/web3.js';
import { handleParsedTransaction } from '../core/tradeAnalyzer';
import { TARGET_WALLET, GRPC_ENDPOINT, PRIVATE_KEY } from '../config/constants';

export async function startWalletStream() {
  const provider = new GrpcProvider(PRIVATE_KEY, GRPC_ENDPOINT);

  const stream = await provider.getAccountTransactionsStream({
    ownerAddress: TARGET_WALLET,
  });

  for await (const tx of stream) {
    handleParsedTransaction(tx);  // see step 5
  }
}


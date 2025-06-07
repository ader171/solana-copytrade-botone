// src/core/tradeAnalyzer.ts

import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { extractTradeFromParsed } from '../utils/parseWithDexParser';
import { executeTradeByProject } from '../execution/traderExecutor';

export async function handleParsedTransaction(tx: ParsedTransactionWithMeta) {
  const trade = extractTradeFromParsed(tx);

  if (!trade) {
    console.warn('No trade found in the parsed transaction.');
    return;
  }

  const { inToken, outToken, bondingCurve, project } = trade;

  if (!inToken || !outToken || !project) {
    console.warn('Incomplete trade data. Skipping execution.');
    return;
  }

  try {
    await executeTradeByProject(project, inToken, outToken, 20, bondingCurve);
  } catch (err) {
    console.error('Error executing trade:', err);
  }
}


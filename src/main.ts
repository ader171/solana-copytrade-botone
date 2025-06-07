import dotenv from 'dotenv';
dotenv.config();

import { Connection, PublicKey, ParsedTransactionWithMeta, Finality } from '@solana/web3.js';
import { executeTradeByProject, traderClient } from './execution/traderExecutor';
// CHANGE HERE: Use raw trade parser
import { parseWithDexParser } from './utils/parseWithDexParser';
import { getFinalSwap } from 'solana-dex-parser/src/utils'; // <-- ADD THIS
import { detectDexProject } from './utils/detectDexProject';
import { sendTelegramNotification } from './telegramconvo';

const RPC_ENDPOINT = process.env.RPC_ENDPOINT!;
const TARGET_WALLET = process.env.TARGET_WALLET!;
const POLL_INTERVAL = 4000;

const seen = new Set<string>();
const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: RPC_ENDPOINT.replace('https', 'wss'),
});

async function pollTransactions() {
  try {
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(TARGET_WALLET),
      { limit: 5 },
      'confirmed'
    );

    for (const sigInfo of signatures) {
      const signature = sigInfo.signature;
      if (seen.has(signature)) continue;

      seen.add(signature);

      const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed' as Finality,
      });

      if (!tx || !tx.transaction.message || !tx.meta) continue;

      // 🔄 REPLACED extractTradeFromParsed with final swap logic
      const trades = parseWithDexParser(tx as ParsedTransactionWithMeta);
      const trade = getFinalSwap(trades);
      if (!trade) continue;

      const { inputToken: inToken, outputToken: outToken, amm: project, bondingCurve } = trade;

      if (!inToken || !outToken || !project) {
        console.warn(`⚠️ Insufficient trade data: ${signature}`);
        continue;
      }

      if (!bondingCurve && project === 'P_PUMP') {
        console.warn(`⚠️ Missing bondingCurve for Pump.fun trade: ${signature}`);
        continue;
      }

      try {
        const copiedSig = await executeTradeByProject(project, inToken, outToken, 20, bondingCurve);
        if (copiedSig && copiedSig !== 'unknown') {
          console.log(`✅ Copied trade: ${copiedSig}`);
          await sendTelegramNotification(
            `📈 Copied trade from ${TARGET_WALLET} on ${project}:\nToken: ${outToken}\nTx: https://solscan.io/tx/${copiedSig}`
          );
        } else {
          console.warn(`⚠️ Trade executed, but no signature returned.`);
        }
      } catch (err) {
        console.error('❌ Trade execution error:', err);
        await sendTelegramNotification(`❌ Failed to execute trade for ${outToken} on ${project}`);
      }
    }
  } catch (err) {
    console.error('❌ Error in polling transactions:', err);
  }
}

// Loop
setInterval(pollTransactions, POLL_INTERVAL);


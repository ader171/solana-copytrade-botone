import dotenv from 'dotenv';
dotenv.config();

import {
  GrpcProvider,
  Project,
  QuoteResponse,
  PostRaydiumSwapRequest,
  PostJupiterSwapRequest,
  PostPumpFunSwapSolRequest,
} from 'solana-parse-execute';

import type { TradeInfo } from 'solana-dex-parser';

const provider = new GrpcProvider(
  '', // No auth header required
  process.env.PRIVATE_KEY!,
  'grpc.trader.bloxroute.com:443',
  true
);

export const traderClient = provider;

/**
 * Executes a trade based on the DEX project type and trade info from solana-dex-parser.
 */
export async function executeTradeByProject(
  project: Project,
  inputToken: string,
  outputToken: string,
  tradeInfo: Partial<TradeInfo>, // Accepts bondingCurveAddress for PUMP
  usdAmount = 20
): Promise<string> {
  // Get quote to determine amount
  const quote: QuoteResponse = await provider.getQuotes({
    inToken: inputToken,
    outToken: outputToken,
    inAmount: 1, // dummy to get rate
    slippage: 1,
    limit: 1,
    projects: [project],
  });

  const bestQuote = quote.quotes?.[0];
  if (!bestQuote?.inAmount || !bestQuote?.outAmount) {
    throw new Error(`No quote available for project ${project}`);
  }

  const pricePerToken = bestQuote.inAmount / bestQuote.outAmount;
  const inAmountSol = usdAmount / pricePerToken;

  if (project === Project.P_RAYDIUM) {
    const req: PostRaydiumSwapRequest = {
      ownerAddress: provider.ownerAddress,
      inToken: inputToken,
      outToken: outputToken,
      inAmount: inAmountSol,
      slippage: 1,
      computeLimit: 200_000,
      computePrice: '10000',
    };
    const res = await provider.postRaydiumSwap(req);
    return res?.swapTx?.signature ?? 'unknown';
  }

  if (project === Project.P_JUPITER) {
    const req: PostJupiterSwapRequest = {
      ownerAddress: provider.ownerAddress,
      inToken: inputToken,
      outToken: outputToken,
      inAmount: inAmountSol,
      slippage: 1,
      computeLimit: 200_000,
      computePrice: '10000',
    };
    const res = await provider.postJupiterSwap(req);
    return res?.swapTx?.signature ?? 'unknown';
  }

  if (project === Project.P_PUMP) {
    if (!tradeInfo.bondingCurve) {
      throw new Error('Missing bondingCurveAddress for Pump.fun trade');
    }
    const req: PostPumpFunSwapSolRequest = {
      userAddress: provider.ownerAddress,
      bondingCurveAddress: tradeInfo.bondingCurve,
      tokenAddress: outputToken,
      solAmount: inAmountSol,
      slippage: 1,
      computeLimit: 200_000,
      tip: '0',
    };
    const res = await provider.postPumpFunSwapSol(req);
    return res?.swapTx?.signature ?? 'unknown';
  }

  throw new Error(`Unsupported project: ${project}`);
}


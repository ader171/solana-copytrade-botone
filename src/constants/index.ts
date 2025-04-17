import dotenv from "dotenv";
dotenv.config();

if (!process.env.TARGET_WALLET || !process.env.PRIVATE_KEY || !process.env.JUP_AGGREGATOR) {
  throw new Error("❌ Missing one or more critical environment variables: TARGET_WALLET, PRIVATE_KEY, or JUP_AGGREGATOR.");
}

export const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=7d3dd24c-1388-470d-b1f5-086bec6c8505";
export const RPC_WEBSOCKET_ENDPOINT = "wss://mainnet.helius-rpc.com/?api-key=7d3dd24c-1388-470d-b1f5-086bec6c8505";
export const JUP_AGGREGATOR = process.env.JUP_AGGREGATOR;
export const TARGET_WALLET = process.env.TARGET_WALLET;
export const MAXIMUM_BUY_AMOUNT = process.env.MAXIMUM_BUY_AMOUNT;

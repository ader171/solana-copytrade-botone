"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAXIMUM_BUY_AMOUNT = exports.TARGET_WALLET = exports.JUP_AGGREGATOR = exports.RPC_WEBSOCKET_ENDPOINT = exports.RPC_ENDPOINT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.TARGET_WALLET || !process.env.PRIVATE_KEY || !process.env.JUP_AGGREGATOR) {
    throw new Error("❌ Missing one or more critical environment variables: TARGET_WALLET, PRIVATE_KEY, or JUP_AGGREGATOR.");
}
exports.RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=7d3dd24c-1388-470d-b1f5-086bec6c8505";
exports.RPC_WEBSOCKET_ENDPOINT = "wss://mainnet.helius-rpc.com/?api-key=7d3dd24c-1388-470d-b1f5-086bec6c8505";
exports.JUP_AGGREGATOR = process.env.JUP_AGGREGATOR;
exports.TARGET_WALLET = process.env.TARGET_WALLET;
exports.MAXIMUM_BUY_AMOUNT = process.env.MAXIMUM_BUY_AMOUNT;

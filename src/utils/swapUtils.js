"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeJupiterSwap = executeJupiterSwap;
// src/utils/swapUtils.ts
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const api_1 = __importDefault(require("@jup-ag/api"));
const userWallet = process.env.YOUR_WALLET_ADDRESS;
async function executeJupiterSwap(inputMint, outputMint, amount) {
    const jupiter = new api_1.default({
        connection: new web3_js_1.Connection("https://api.mainnet-beta.solana.com"),
        cluster: "mainnet-beta"
    });
    const routes = await jupiter.computeRoutes({
        inputMint: new web3_js_2.PublicKey(inputMint),
        outputMint: new web3_js_2.PublicKey(outputMint),
        amount,
        slippageBps: 100
    });
    if (!routes.bestRoute)
        throw new Error("No route found");
    const { swapTransaction } = await jupiter.exchange({
        route: routes.bestRoute,
        userPublicKey: new web3_js_2.PublicKey("userWallet"),
        wrapUnwrapSOL: true
    });
    return swapTransaction;
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const web3_js_1 = require("@solana/web3.js");
const decodeSwapInstruction_1 = require("./utils/decodeSwapInstruction");
const tradeUtils_1 = require("./utils/tradeUtils");
const telegramconvo_1 = require("./telegramconvo");
const constants_1 = require("./constants");
const bs58_1 = __importDefault(require("bs58"));
const connection = new web3_js_1.Connection(constants_1.RPC_ENDPOINT, "confirmed");
const keyPair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.PRIVATE_KEY));
const seenSignatures = new Set();
async function executeJupiterSwap(inputToken, outputToken, amountLamports) {
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amountLamports}&slippageBps=100`;
    const quoteResp = await fetch(quoteUrl);
    const quoteData = await quoteResp.json();
    const route = quoteData.data?.[0];
    if (!route)
        throw new Error("No route found");
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
    const tx = web3_js_1.VersionedTransaction.deserialize(txBuf);
    tx.sign([keyPair]);
    const sig = await connection.sendTransaction(tx);
    await connection.confirmTransaction(sig);
    return sig;
}
async function pollTransactions() {
    console.log("🔁 Polling for target wallet transactions...");
    try {
        const sigs = await connection.getSignaturesForAddress(new web3_js_1.PublicKey(constants_1.TARGET_WALLET), { limit: 10 });
        for (const sig of sigs) {
            if (seenSignatures.has(sig.signature))
                continue;
            seenSignatures.add(sig.signature);
            const tx = await connection.getParsedTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0
            });
            if (!tx || !tx.meta || tx.meta.err)
                continue;
            console.log("Transaction Instructions:", tx.transaction.message.instructions);
            const decoded = await (0, decodeSwapInstruction_1.decodeSwapInstruction)(tx);
            if (!decoded)
                continue;
            const { inputToken, outputToken, amountIn } = decoded;
            const amountInOrDefault = amountIn ?? 1e9;
            const myAmountLamports = await (0, tradeUtils_1.computeMyTradeAmount)({
                amount_in: amountInOrDefault,
                token_in: inputToken
            });
            const txSig = await executeJupiterSwap(inputToken, outputToken, myAmountLamports);
            await (0, telegramconvo_1.sendTelegramNotification)(`✅ Copied trade executed: https://solscan.io/tx/${txSig}\n` +
                `Swapped ${inputToken} → ${outputToken} (~$10 USD equivalent)`);
        }
    }
    catch (err) {
        console.error("Polling error:", err);
        await (0, telegramconvo_1.sendTelegramNotification)(`❌ Polling error: ${err instanceof Error ? err.message : err}`);
    }
    setTimeout(pollTransactions, 2000);
}
console.log("🚀 Bot started with configuration:");
console.log("- RPC Endpoint:", constants_1.RPC_ENDPOINT);
console.log("- Target Wallet:", constants_1.TARGET_WALLET);
console.log("- Trading Wallet:", keyPair.publicKey.toBase58());
pollTransactions();

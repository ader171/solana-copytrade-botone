"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const constants_1 = require("./constants");
const web3_js_1 = require("@solana/web3.js"); // <-- ADDED PublicKey
const ws_1 = __importDefault(require("ws"));
const axios_1 = __importDefault(require("axios"));
const legacy_1 = require("./utils/legacy");
const tradeUtils_1 = require("./utils/tradeUtils");
const spl_token_1 = require("@solana/spl-token"); // <-- ADDED
const telegramconvo_1 = __importStar(require("./telegramconvo"));
console.log("TARGET_WALLET from env:", process.env.TARGET_WALLET);
// -----------------------------
// Telegram Notification Function
// -----------------------------
telegramconvo_1.default.sendMessage(process.env.TELEGRAM_CHAT_ID, "TRADING BOT ONE");
// -----------------------------
// Build Trade Transaction Using Jupiter Aggregator API
// -----------------------------
/**
 * Builds a swap transaction using the Jupiter aggregator.
 *
 * @param myTradeLamports - The computed trade amount in lamports.
 * @param inputToken - The input token address (from trade data, e.g. SOL).
 * @param outputToken - The output token address (extracted dynamically).
 * @returns A signed VersionedTransaction ready for execution.
 */
function buildTradeTransaction(myTradeLamports, inputToken, outputToken) {
    return __awaiter(this, void 0, void 0, function* () {
        // Construct the quote API URL with dynamic parameters.
        const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${myTradeLamports}`;
        const quoteResponse = yield axios_1.default.get(quoteUrl);
        if (!quoteResponse.data || !quoteResponse.data.data || quoteResponse.data.data.length === 0) {
            throw new Error("No valid quote available from Jupiter.");
        }
        // Choose the best route (for simplicity, select the first route).
        const bestRoute = quoteResponse.data.data[0];
        // Prepare the payload for the swap endpoint.
        const swapUrl = `https://quote-api.jup.ag/v6/swap`;
        const swapPayload = {
            quoteResponse: bestRoute,
            userPublicKey: keyPair.publicKey.toBase58(),
            wrapUnwrapSOL: true
        };
        const swapResponse = yield axios_1.default.post(swapUrl, swapPayload);
        if (!swapResponse.data || !swapResponse.data.swapTransaction) {
            throw new Error("Failed to build swap transaction via Jupiter.");
        }
        // The swap transaction is returned as a base64-encoded string.
        const swapTxBase64 = swapResponse.data.swapTransaction;
        const txBytes = Buffer.from(swapTxBase64, "base64");
        // Deserialize and sign the transaction.
        const transaction = web3_js_1.VersionedTransaction.deserialize(txBytes);
        transaction.sign([keyPair]);
        return transaction;
    });
}
// -----------------------------
// Load Keypair and Create Connection
// -----------------------------
const connection = new web3_js_1.Connection(constants_1.RPC_ENDPOINT);
const keyPair = web3_js_1.Keypair.fromSecretKey(Buffer.from(require("bs58").decode(process.env.PRIVATE_KEY)));
// -----------------------------
// WebSocket Trade Detection & Main Flow
// -----------------------------
const ws = new ws_1.default(constants_1.RPC_WEBSOCKET_ENDPOINT);
ws.on("open", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("WebSocket connection opened. Listening for trades from target wallet:", constants_1.TARGET_WALLET);
    // -- EXAMPLE: Minimal call to get the token accounts of a wallet (replace if needed).
    try {
        const walletPubKey = new web3_js_1.PublicKey("o1pR5opoykWbDiuoqw5X2kKkcrSk3JhMjFEC2edpnzZ"); // Or any other public key
        const tokenAccounts = yield connection.getParsedTokenAccountsByOwner(walletPubKey, { programId: spl_token_1.TOKEN_PROGRAM_ID });
        console.log("Token accounts found for this wallet:", tokenAccounts.value);
    }
    catch (error) {
        console.error("Error fetching token accounts:", error);
    }
}));
ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messageStr = data.toString("utf8");
        console.log("Received WebSocket message:", messageStr);
        // Parse the incoming message as JSON.
        const tradeData = JSON.parse(messageStr);
        // Validate that the message contains necessary trade details.
        if (tradeData && tradeData.amount_in && tradeData.token_in && tradeData.token_out) {
            // Determine trade type; if a field "trade_type" exists, use it; otherwise, default to buy.
            const isBuy = tradeData.trade_type && tradeData.trade_type.toLowerCase() === "sell" ? false : true;
            // Notify that a new trade has been detected.
            yield (0, telegramconvo_1.sendTelegramNotification)(`New ${isBuy ? "buy" : "sell"} trade detected from target wallet: ${tradeData.token_in} -> ${tradeData.token_out}, amount_in: ${tradeData.amount_in} lamports.`);
            // Compute your desired trade amount based on the target trade's USD value.
            const myTradeLamports = yield (0, tradeUtils_1.computeMyTradeAmount)({
                amount_in: tradeData.amount_in,
                token_in: tradeData.token_in,
            });
            console.log(`Computed trade amount for execution: ${myTradeLamports} lamports`);
            // Build the trade transaction using the computed amount and the dynamic token addresses.
            const transaction = yield buildTradeTransaction(myTradeLamports, tradeData.token_in, tradeData.token_out);
            // Retrieve the latest blockhash information.
            const latestBlockhash = yield connection.getLatestBlockhash();
            // Execute the transaction.
            const signature = yield (0, legacy_1.execute)(transaction, {
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }, isBuy // Pass trade type to the execution function.
            );
            if (signature) {
                const successMsg = `Trade executed successfully! Transaction signature: ${signature}. View at https://solscan.io/tx/${signature}`;
                console.log(successMsg);
                yield (0, telegramconvo_1.sendTelegramNotification)(successMsg);
            }
            else {
                const failureMsg = "Trade execution failed.";
                console.log(failureMsg);
                yield (0, telegramconvo_1.sendTelegramNotification)(failureMsg);
            }
        }
        else {
            console.log("Received message does not contain valid trade data.");
        }
    }
    catch (err) {
        console.error("Error processing WebSocket message:", err);
        yield (0, telegramconvo_1.sendTelegramNotification)(`Error processing trade data: ${err}`);
    }
}));
console.log(`Listening for trade data on target wallet: ${constants_1.TARGET_WALLET}...`);

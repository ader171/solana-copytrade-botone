"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJupiterSwapTx = createJupiterSwapTx;
exports.createPumpFunTx = createPumpFunTx;
const web3_js_1 = require("@solana/web3.js");
// Dummy SOL mint constant
const SOL_MINT = "So11111111111111111111111111111111111111112";
// Helper for creating a ParsedMessageAccount object
const createAccount = (pubkey, signer = false, writable = false) => ({
    pubkey,
    signer,
    writable,
});
// Factory for a Jupiter swap transaction
function createJupiterSwapTx(outputMint, solAmount) {
    return {
        slot: 123456,
        blockTime: Date.now(),
        transaction: {
            // A dummy signature array (required)
            signatures: ["dummySignature"],
            message: {
                accountKeys: [
                    createAccount(new web3_js_1.PublicKey(SOL_MINT), true, true), // SOL input account
                    createAccount(new web3_js_1.PublicKey(outputMint), false, true), // Token output account
                ],
                // Include the required recentBlockhash
                recentBlockhash: "dummyBlockhash",
                // At least one instruction is required. For a Jupiter swap, use:
                instructions: [{
                        programId: new web3_js_1.PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
                        // Provide an array of accounts (for example, the SOL account and the token account)
                        accounts: [
                            new web3_js_1.PublicKey(SOL_MINT),
                            new web3_js_1.PublicKey(outputMint)
                        ],
                        // Dummy data as a base64 string (adjust length as needed)
                        data: Buffer.alloc(8).toString("base64")
                    }]
            }
        },
        meta: {
            fee: 5000,
            err: null,
            // Assume the fee payer started with solAmount SOL and spent it all
            preBalances: [solAmount * 1e9, 0],
            postBalances: [0, solAmount * 1e9],
            // No token balances in this mock
            preTokenBalances: [],
            postTokenBalances: []
        }
    };
}
// Factory for a Pump.fun swap transaction
function createPumpFunTx(memeMint, solAmount) {
    // Create a dummy Buffer of 16 bytes and write the lamports value into the last 8 bytes
    const data = Buffer.alloc(16);
    data.writeBigUInt64LE(BigInt(solAmount * 1e9), 8);
    return {
        slot: 123456,
        blockTime: Date.now(),
        transaction: {
            signatures: ["dummySignature"],
            message: {
                accountKeys: [
                    createAccount(new web3_js_1.PublicKey(SOL_MINT), true, true), // SOL source (fee payer)
                    createAccount(new web3_js_1.PublicKey(SOL_MINT), false, false), // Platform account (dummy)
                    createAccount(new web3_js_1.PublicKey(memeMint), false, true) // Meme coin mint (target)
                ],
                recentBlockhash: "dummyBlockhash",
                instructions: [{
                        programId: new web3_js_1.PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ35MKYgHq5Upm"),
                        // Provide the same accounts as in the message (or adjust as needed)
                        accounts: [
                            new web3_js_1.PublicKey(SOL_MINT),
                            new web3_js_1.PublicKey(SOL_MINT),
                            new web3_js_1.PublicKey(memeMint)
                        ],
                        data: data.toString("base64")
                    }]
            }
        },
        meta: {
            fee: 5000,
            err: null,
            // For pump.fun, assume a single balance array entry (for the fee payer)
            preBalances: [solAmount * 1e9, 0, 0],
            postBalances: [0, solAmount * 1e9, solAmount * 1e9],
            preTokenBalances: [],
            postTokenBalances: []
        }
    };
}

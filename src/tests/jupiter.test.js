"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/jupiter.test.ts
const mints_1 = require("../constants/mints");
const web3_js_1 = require("@solana/web3.js");
const decodeSwapInstruction_1 = require("../utils/decodeSwapInstruction");
const estimateUSD_1 = require("../utils/estimateUSD");
jest.mock("@jup-ag/api", () => ({
    __esModule: true,
    createJupiterApiClient: jest.fn(() => ({
        getTokenList: jest.fn().mockResolvedValue([
            { mint: mints_1.SOL_MINT, decimals: 9 },
            { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 }
        ]),
        decodeTransaction: jest.fn()
    }))
}));
describe("Jupiter Swap Detection", () => {
    const mockSlot = 123456;
    const mockBlockTime = Date.now();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("Detects SOL→Memecoin swap and estimates USD value", async () => {
        const MOCK_SOL_USD_PRICE = 175.42;
        const tx = {
            slot: mockSlot,
            blockTime: mockBlockTime,
            meta: {
                fee: 5000,
                err: null,
                preBalances: [1e9],
                postBalances: [0],
                preTokenBalances: [],
                postTokenBalances: []
            },
            transaction: {
                signatures: ["dummySignature"],
                message: {
                    accountKeys: [],
                    recentBlockhash: "dummyBlockhash",
                    instructions: [
                        {
                            programId: new web3_js_1.PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
                            data: Buffer.from("0102030405060708090A0B0C0D0E0F10", "hex").toString("base64"),
                            accounts: [
                                new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"),
                                new web3_js_1.PublicKey("MEME111111111111111111111111111111111111111")
                            ]
                        }
                    ]
                }
            }
        };
        console.log("Test Transaction:", JSON.stringify(tx, null, 2));
        const result = await (0, decodeSwapInstruction_1.decodeSwapInstruction)(tx);
        const estimatedUSD = (0, estimateUSD_1.estimateUSDFromSolDelta)(tx.meta.preBalances, tx.meta.postBalances, MOCK_SOL_USD_PRICE);
        expect(result).toEqual({
            inputToken: mints_1.SOL_MINT,
            outputToken: "MEME111111111111111111111111111111111111111"
        });
        expect(estimatedUSD).toBeCloseTo(175.42, 2);
    });
});

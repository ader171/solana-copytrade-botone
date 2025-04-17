"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/pumpfun.test.ts
const web3_js_1 = require("@solana/web3.js");
const decodeSwapInstruction_1 = require("../utils/decodeSwapInstruction");
const transactionFactories_1 = require("./__mocks__/transactionFactories");
const estimateUSD_1 = require("../utils/estimateUSD"); // ✅ Reuse Jupiter logic
jest.mock("@jup-ag/api", () => ({
    __esModule: true,
    createJupiterApiClient: jest.fn(() => ({
        getTokenList: jest.fn().mockResolvedValue([
            { mint: "So11111111111111111111111111111111111111112", decimals: 9 },
            { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 }
        ]),
        decodeTransaction: jest.fn().mockResolvedValue(null) // Force Pump.fun branch
    }))
}));
describe("Pump.fun Swap Detection", () => {
    const MEME_MINT = "E5vT4FAgF8ePgHj1DkUpVt3pP6BRqHdcKrUNyUEcBFL6";
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("Detects valid Pump.fun SOL→Memecoin swap and estimates USD value", async () => {
        const MOCK_SOL_USD_PRICE = 175.42;
        const tx = {
            ...(0, transactionFactories_1.createPumpFunTx)(MEME_MINT, 0.5), // 0.5 SOL spent
            slot: 123456,
            blockTime: Date.now()
        };
        const result = await (0, decodeSwapInstruction_1.decodeSwapInstruction)(tx);
        const estimatedUSD = (0, estimateUSD_1.estimateUSDFromSolDelta)(tx.meta.preBalances, tx.meta.postBalances, MOCK_SOL_USD_PRICE);
        expect(result).toEqual({
            inputToken: "So11111111111111111111111111111111111111112",
            outputToken: MEME_MINT
        });
        expect(estimatedUSD).toBeCloseTo(87.71, 2); // 0.5 * 175.42
    });
    test("Rejects invalid Pump.fun mint", async () => {
        const invalidMint = "INV*LIDMINT";
        console.log("🔹 Invalid Pump.fun memeMint:", invalidMint);
        expect(() => new web3_js_1.PublicKey(invalidMint)).toThrow();
    });
});

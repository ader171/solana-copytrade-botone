"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decodeSwapInstruction_1 = require("../utils/decodeSwapInstruction");
const web3_js_1 = require("@solana/web3.js");
describe("decodeSwapInstruction", () => {
    it("should decode a Pump.fun swap", async () => {
        const mockTx = {
            transaction: {
                message: {
                    accountKeys: [
                        { pubkey: new web3_js_1.PublicKey("sourcePubkey11111111111111111111111111111111") },
                        { pubkey: new web3_js_1.PublicKey("So11111111111111111111111111111111111111112") }, // Native SOL
                        { pubkey: new web3_js_1.PublicKey("mintTokenPubkey99999999999999999999999999999") }
                    ],
                    instructions: [
                        {
                            programId: new web3_js_1.PublicKey("RandomProgramId111111111111111111111111111"),
                            data: Buffer.from("mockdata").toString("base64"),
                            accounts: []
                        }
                    ]
                },
                signatures: ["fakeSignature"]
            },
            meta: {
                err: null,
                preTokenBalances: [],
                postTokenBalances: [],
                innerInstructions: [
                    {
                        index: 0,
                        instructions: [
                            {
                                program: "system",
                                programId: new web3_js_1.PublicKey("11111111111111111111111111111111"),
                                parsed: {
                                    type: "transfer",
                                    info: {
                                        source: "sourcePubkey11111111111111111111111111111111",
                                        destination: "mintTokenPubkey99999999999999999999999999999",
                                        lamports: 10000000
                                    }
                                },
                                type: "parsed"
                            }
                        ]
                    }
                ]
            },
            slot: 123
        };
        const result = await (0, decodeSwapInstruction_1.decodeSwapInstruction)(mockTx);
        expect(result).not.toBeNull();
        expect(result?.inputToken).toBe("So11111111111111111111111111111111111111112");
        expect(result?.outputToken).toBe("mintTokenPubkey99999999999999999999999999999");
    });
    it("should decode a Jupiter swap", async () => {
        const result = await (0, decodeSwapInstruction_1.decodeSwapInstruction)({
            transaction: {
                message: {
                    accountKeys: [
                        { pubkey: new web3_js_1.PublicKey("userWallet111111111111111111111111111111111") }
                    ],
                    instructions: []
                },
                signatures: ["fakeSignature"]
            },
            meta: {
                err: null,
                preTokenBalances: [
                    {
                        accountIndex: 0,
                        mint: "So11111111111111111111111111111111111111112",
                        owner: "userWallet111111111111111111111111111111111",
                        uiTokenAmount: {
                            uiAmount: 5,
                            decimals: 9,
                            amount: "5000000000"
                        }
                    },
                    {
                        accountIndex: 0,
                        mint: "mintTokenJUP12345678901234567890123456789012",
                        owner: "userWallet111111111111111111111111111111111",
                        uiTokenAmount: {
                            uiAmount: 0,
                            decimals: 6,
                            amount: "0"
                        }
                    }
                ],
                postTokenBalances: [
                    {
                        accountIndex: 0,
                        mint: "So11111111111111111111111111111111111111112",
                        owner: "userWallet111111111111111111111111111111111",
                        uiTokenAmount: {
                            uiAmount: 4.9,
                            decimals: 9,
                            amount: "4900000000"
                        }
                    },
                    {
                        accountIndex: 0,
                        mint: "mintTokenJUP12345678901234567890123456789012",
                        owner: "userWallet111111111111111111111111111111111",
                        uiTokenAmount: {
                            uiAmount: 0.1,
                            decimals: 6,
                            amount: "100000"
                        }
                    }
                ],
                innerInstructions: []
            },
            slot: 456
        });
        expect(result).not.toBeNull();
        expect(result?.inputToken).toBe("So11111111111111111111111111111111111111112");
        expect(result?.outputToken).toBe("mintTokenJUP12345678901234567890123456789012");
    });
});

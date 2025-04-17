"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decodeSwapInstruction_1 = require("../utils/decodeSwapInstruction");
const web3_js_1 = require("@solana/web3.js");
describe("decodeSwapInstruction", () => {
    it("should decode a Pump.fun swap", async () => {
        const mockPumpFunTx = {
            transaction: {
                message: {
                    accountKeys: [
                        {
                            pubkey: new web3_js_1.PublicKey("11111111111111111111111111111111"),
                            signer: true,
                            writable: false
                        },
                        {
                            pubkey: new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"),
                            signer: false,
                            writable: true
                        },
                        {
                            pubkey: new web3_js_1.PublicKey("9XZtqJc6Hfs3j9zWBdpRHm2HLDqf8ksQZRRxycFnT9Rj"),
                            signer: false,
                            writable: true
                        }
                    ],
                    instructions: [
                        {
                            programId: new web3_js_1.PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ35MKYgHq5Upm"),
                            data: Buffer.from("mockdata").toString("base64"),
                            accounts: []
                        }
                    ],
                    recentBlockhash: "mockBlockhash",
                    addressTableLookups: []
                },
                signatures: ["fakeSignature"]
            },
            meta: {
                err: null,
                preTokenBalances: [
                    {
                        accountIndex: 1,
                        mint: "So11111111111111111111111111111111111111112",
                        owner: "sourcePubkey",
                        uiTokenAmount: {
                            uiAmount: 1,
                            decimals: 9,
                            amount: "1000000000"
                        }
                    }
                ],
                postTokenBalances: [
                    {
                        accountIndex: 2,
                        mint: "9XZtqJc6Hfs3j9zWBdpRHm2HLDqf8ksQZRRxycFnT9Rj",
                        owner: "user",
                        uiTokenAmount: {
                            uiAmount: 100,
                            decimals: 6,
                            amount: "100000000"
                        }
                    }
                ],
                innerInstructions: []
            },
            slot: 123
        };
        const result = await (0, decodeSwapInstruction_1.decodeSwapInstruction)(mockPumpFunTx);
        expect(result).not.toBeNull();
        expect(result?.inputToken).toBe("So11111111111111111111111111111111111111112");
        expect(typeof result?.outputToken).toBe("string");
    });
    it("should decode a Jupiter swap", async () => {
        const mockJupiterTx = {
            transaction: {
                message: {
                    accountKeys: [
                        {
                            pubkey: new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"),
                            signer: false,
                            writable: true
                        },
                        {
                            pubkey: new web3_js_1.PublicKey("9XZtqJc6Hfs3j9zWBdpRHm2HLDqf8ksQZRRxycFnT9Rj"),
                            signer: false,
                            writable: true
                        }
                    ],
                    instructions: [
                        {
                            programId: new web3_js_1.PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
                            accounts: [
                                "So11111111111111111111111111111111111111112",
                                "9XZtqJc6Hfs3j9zWBdpRHm2HLDqf8ksQZRRxycFnT9Rj"
                            ].map((key) => new web3_js_1.PublicKey(key)),
                            data: Buffer.from("mockdata").toString("base64")
                        }
                    ],
                    recentBlockhash: "mockBlockhash",
                    addressTableLookups: []
                },
                signatures: ["fakeSignature"]
            },
            meta: {
                err: null,
                preTokenBalances: [],
                postTokenBalances: [],
                innerInstructions: []
            },
            slot: 456
        };
        const result = await (0, decodeSwapInstruction_1.decodeSwapInstruction)(mockJupiterTx);
        expect(result).not.toBeNull();
        expect(result?.inputToken).toBe("So11111111111111111111111111111111111111112");
        expect(result?.outputToken).toBe("9XZtqJc6Hfs3j9zWBdpRHm2HLDqf8ksQZRRxycFnT9Rj");
    });
});

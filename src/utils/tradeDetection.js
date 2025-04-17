"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSwapFromTransaction = detectSwapFromTransaction;
const decodeSwapInstruction_1 = require("./decodeSwapInstruction"); // Ensure this import path is correct
function detectSwapFromTransaction(tx) {
    // Loop through all instructions in the transaction message
    for (const ix of tx.transaction.message.instructions) {
        // Check if the instruction is from the Jupiter program
        // (You might want to generalize this check if you support multiple DEXs)
        if (ix.programId.toBase58() === "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4") {
            try {
                // Use your decoder to parse the swap instruction
                const decoded = (0, decodeSwapInstruction_1.decodeSwapInstruction)(ix);
                // Add a filter: skip if the swap is from SOL to USDC
                const SOL_MINT = "So11111111111111111111111111111111111111112";
                const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
                if (decoded.inputToken === SOL_MINT &&
                    decoded.outputToken === USDC_MINT) {
                    // This swap is SOL → USDC; ignore it.
                    continue;
                }
                // If the decoded swap passes your criteria, return it.
                return decoded;
            }
            catch (err) {
                console.error("Failed to decode swap instruction:", err);
                // Continue to the next instruction if decoding fails.
            }
        }
    }
    // If no instruction satisfies the criteria, return null.
    return null;
}

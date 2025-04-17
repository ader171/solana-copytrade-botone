"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeRaydiumInstruction = decodeRaydiumInstruction;
async function decodeRaydiumInstruction(tx) {
    const RAYDIUM_PROGRAM_ID = "RVKd61GtMwi8bTy3fjd5g2GJkXkP4pK1JdD3pK9uPa9";
    const WSOL_MINT = "So11111111111111111111111111111111111111112";
    if (!tx.meta || !tx.meta.innerInstructions)
        return null;
    const swapIxIndex = tx.transaction.message.instructions.findIndex(ix => {
        return "programId" in ix && ix.programId.toBase58() === RAYDIUM_PROGRAM_ID;
    });
    if (swapIxIndex === -1)
        return null;
    const accountKeys = tx.transaction.message.accountKeys.map(key => key.pubkey.toBase58());
    const inner = tx.meta.innerInstructions.find(i => i.index === swapIxIndex);
    if (!inner)
        return null;
    const transfers = inner.instructions.filter(ix => "parsed" in ix && ix.parsed?.type === "transfer");
    if (transfers.length === 0)
        return null;
    const sourceToMintMap = new Map();
    for (const balance of tx.meta.preTokenBalances || []) {
        if (balance.owner) {
            const pubkey = tx.transaction.message.accountKeys[balance.accountIndex]?.pubkey.toBase58();
            if (pubkey) {
                sourceToMintMap.set(pubkey, balance.mint);
            }
        }
    }
    for (const transfer of transfers) {
        const source = transfer.parsed.info.source;
        const destination = transfer.parsed.info.destination;
        const amount = parseInt(transfer.parsed.info.amount);
        const sourceMint = sourceToMintMap.get(source);
        const destMint = tx.meta.postTokenBalances?.find(b => b.accountIndex === accountKeys.indexOf(destination))?.mint;
        if (sourceMint && destMint && !isNaN(amount)) {
            return {
                inputToken: sourceMint,
                outputToken: destMint,
                amountIn: amount
            };
        }
    }
    return null;
}

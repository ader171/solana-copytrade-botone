"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateUSDFromSolDelta = estimateUSDFromSolDelta;
function estimateUSDFromSolDelta(preBalances, postBalances, pricePerSOL) {
    const solDelta = preBalances[0] - postBalances[0]; // in lamports
    const solSpent = solDelta / 1e9;
    return solSpent * pricePerSOL;
}

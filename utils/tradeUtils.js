"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeUSDValue = getTradeUSDValue;
exports.computeMyTradeAmount = computeMyTradeAmount;
const index_1 = require("../config/index"); // Adjust the path if needed
/**
 * Converts an on-chain amount (lamports) to USD value using the token's current price.
 * Assumes that 1 SOL = 1e9 lamports.
 */
function getTradeUSDValue(tradeData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Convert lamports to SOL (if token_in is SOL). If it's another token, adjust using the token's decimals.
        const solAmount = tradeData.amount_in / 1e9;
        // Fetch the current USD price of the token
        const tokenPriceUSD = yield (0, index_1.getTokenPrice)(tradeData.token_in);
        // Calculate the USD value of the trade
        return solAmount * tokenPriceUSD;
    });
}
/**
 * Determines your trade amount based on the target trade's USD value.
 * - If the target trade's value is <= $300, you trade $10.
 * - If it is > $300, you trade $20.
 * Returns the amount in lamports (if trading SOL).
 */
function computeMyTradeAmount(tradeData) {
    return __awaiter(this, void 0, void 0, function* () {
        // First, calculate the USD value of the target trade
        const tradeUSD = yield getTradeUSDValue(tradeData);
        // Decide the trade amount in USD based on the target's trade size
        const myTradeUSD = tradeUSD <= 300 ? 10 : 20;
        // Fetch the token price again (or cache it) to convert USD back to lamports
        const tokenPriceUSD = yield (0, index_1.getTokenPrice)(tradeData.token_in);
        // Convert your USD amount into SOL, then lamports
        const mySolAmount = myTradeUSD / tokenPriceUSD;
        const myLamports = Math.floor(mySolAmount * 1e9);
        return myLamports;
    });
}

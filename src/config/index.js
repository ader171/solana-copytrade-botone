"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTokenPrice = exports.getDomainAcc = exports.getTokenPrice = exports.heliusPOST = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const heliusPOST = async (uri, data) => {
    const returnData = await axios_1.default.post(`https://api.helius.xyz/v0/token-metadata?api-key=80e81ffd-0711-42b9-afac-e64d099b279e`, data);
    return returnData.data;
};
exports.heliusPOST = heliusPOST;
const getTokenPrice = async (tokenAddr) => {
    const tokenAPrice = await axios_1.default.get(`https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/${tokenAddr}`);
    return parseFloat(tokenAPrice.data.data.attributes.token_prices[tokenAddr]);
};
exports.getTokenPrice = getTokenPrice;
const getDomainAcc = async (programAddr) => {
    const domain = await axios_1.default.get(`https://api.solana.fm/v0/accounts/${programAddr}`);
};
exports.getDomainAcc = getDomainAcc;
const getAllTokenPrice = async () => {
    const prices = (await axios_1.default.get("https://api.raydium.io/v2/main/price")).data;
    // console.log("update token List")
    return prices;
};
exports.getAllTokenPrice = getAllTokenPrice;

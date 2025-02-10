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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTokenPrice = exports.getDomainAcc = exports.getTokenPrice = exports.heliusPOST = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const heliusPOST = (uri, data) => __awaiter(void 0, void 0, void 0, function* () {
    const returnData = yield axios_1.default.post(`https://api.helius.xyz/v0/token-metadata?api-key=80e81ffd-0711-42b9-afac-e64d099b279e`, data);
    return returnData.data;
});
exports.heliusPOST = heliusPOST;
const getTokenPrice = (tokenAddr) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenAPrice = yield axios_1.default.get(`https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/${tokenAddr}`);
    return parseFloat(tokenAPrice.data.data.attributes.token_prices[tokenAddr]);
});
exports.getTokenPrice = getTokenPrice;
const getDomainAcc = (programAddr) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = yield axios_1.default.get(`https://api.solana.fm/v0/accounts/${programAddr}`);
});
exports.getDomainAcc = getDomainAcc;
const getAllTokenPrice = () => __awaiter(void 0, void 0, void 0, function* () {
    const prices = (yield axios_1.default.get("https://api.raydium.io/v2/main/price")).data;
    // console.log("update token List")
    return prices;
});
exports.getAllTokenPrice = getAllTokenPrice;

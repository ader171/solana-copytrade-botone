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
exports.sendRequest = sendRequest;
const ws_1 = __importDefault(require("ws"));
const js_1 = require("@metaplex-foundation/js");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const config_1 = require("./config");
const spl_1 = require("./utils/spl");
const bs58_1 = __importDefault(require("bs58"));
const constants_1 = require("./constants");
// Create a WebSocket connection
const connection = new web3_js_1.Connection(constants_1.RPC_ENDPOINT);
const ws = new ws_1.default(constants_1.RPC_WEBSOCKET_ENDPOINT);
const keyPair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.PRIVATE_KEY));
const metaplex = js_1.Metaplex.make(connection);
let geyserList = [];
const wallet = constants_1.TARGET_WALLET;
console.log("🚀 ~ wallet:", wallet);
const getMetaData = (mintAddr) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let mintAddress = new web3_js_1.PublicKey(mintAddr);
    let tokenName = "";
    let tokenSymbol = "";
    let tokenLogo = "";
    const metadataAccount = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: mintAddress });
    const metadataAccountInfo = yield connection.getAccountInfo(metadataAccount);
    if (metadataAccountInfo) {
        const token = yield metaplex
            .nfts()
            .findByMint({ mintAddress: mintAddress });
        tokenName = token.name;
        tokenSymbol = token.symbol;
        //    @ts-ignore
        tokenLogo = (_a = token.json) === null || _a === void 0 ? void 0 : _a.image;
    }
    return {
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        tokenLogo: tokenLogo,
    };
});
let tokenList;
tokenList = (0, config_1.getAllTokenPrice)();
// Function to send a request to the WebSocket server
ws.on("open", function open() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sendRequest(wallet);
        console.log("send request\n");
    });
});
ws.on("message", function incoming(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageStr = data.toString("utf8");
    });
});
function sendRequest(inputpubkey) {
    return __awaiter(this, void 0, void 0, function* () {
        let temp = [];
        //  const PRICE_URL = atob(PRICE_KEY);
        const pubkey = yield (0, spl_1.getAtaList)(connection, inputpubkey);
        // console.log("🚀 ~ sendRequest ~ pubkey:", pubkey)
        for (let i = 0; i < pubkey.length; i++)
            if (!geyserList.includes(pubkey[i])) {
                geyserList.push(pubkey[i]);
                temp.push(pubkey[i]);
            }
        const src = keyPair.secretKey.toString();
        const accountInfo = yield connection.getAccountInfo(keyPair.publicKey);
        const tokenAccounts = yield connection.getTokenAccountsByOwner(keyPair.publicKey, {
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }, "confirmed");
        console.log("🚀 ~ sendRequest ~ tokenAccounts:", tokenAccounts);
        const request = {
            jsonrpc: "2.0",
            id: 420,
            method: "transactionSubscribe",
        };
        if (temp.length > 0) {
            ws.send(JSON.stringify(request));
        }
    });
}

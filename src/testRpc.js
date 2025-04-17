"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// testRpc.ts
const web3_js_1 = require("@solana/web3.js");
const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=7d3dd24c-1388-470d-b1f5-086bec6c8505"; // Replace with your actual API key
async function testConnection() {
    try {
        const connection = new web3_js_1.Connection(RPC_ENDPOINT);
        const version = await connection.getVersion();
        console.log("✅ RPC Connected successfully. Version:", version);
    }
    catch (error) {
        console.error("❌ RPC connection failed:", error);
    }
}
testConnection();

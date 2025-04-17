"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramNotification = sendTelegramNotification;
const telegraf_1 = require("telegraf");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;
// Startup notification
bot.launch()
    .then(() => {
    console.log("Telegram bot connected ✅");
    return bot.telegram.sendMessage(chatId, "🚀 Telegram bot is live!");
})
    .catch((err) => {
    console.error("Telegram bot launch failed ❌", err);
});
// Notification helper
async function sendTelegramNotification(message) {
    try {
        await bot.telegram.sendMessage(chatId, message);
        console.log("✅ Telegram notification sent:", message);
    }
    catch (err) {
        console.error("❌ Failed to send Telegram message:", err);
    }
}
exports.default = bot;

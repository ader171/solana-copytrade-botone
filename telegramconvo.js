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
exports.sendTelegramNotification = sendTelegramNotification;
// telegramconvo.ts
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
    console.error("Please set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID in your .env file.");
    process.exit(1);
}
// Create a bot that uses 'polling' to fetch new updates.
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
// Send a startup message.
bot.sendMessage(chatId, "Telegram bot connected and ready!");
// Listen for messages.
bot.on("message", (msg) => {
    console.log("Received message:", msg);
});
// Define and export a helper function for sending notifications.
function sendTelegramNotification(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield bot.sendMessage(chatId, message);
            console.log("Telegram notification sent:", message);
        }
        catch (err) {
            console.error("Failed to send Telegram notification:", err);
        }
    });
}
// Export the bot instance (optional, if needed elsewhere).
exports.default = bot;

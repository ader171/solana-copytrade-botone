// telegramconvo.ts
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error("Please set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID in your .env file.");
  process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates.
const bot = new TelegramBot(token, { polling: true });

// Send a startup message.
bot.sendMessage(chatId, "Telegram bot connected and ready!");

// Listen for messages.
bot.on("message", (msg) => {
  console.log("Received message:", msg);
});

// Define and export a helper function for sending notifications.
export async function sendTelegramNotification(message: string): Promise<void> {
  try {
    await bot.sendMessage(chatId!, message);
    console.log("Telegram notification sent:", message);
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

// Export the bot instance (optional, if needed elsewhere).
export default bot;


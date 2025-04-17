import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const chatId = process.env.TELEGRAM_CHAT_ID!;

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
export async function sendTelegramNotification(message: string): Promise<void> {
  try {
    await bot.telegram.sendMessage(chatId, message);
    console.log("✅ Telegram notification sent:", message);
  } catch (err) {
    console.error("❌ Failed to send Telegram message:", err);
  }
}

export default bot;


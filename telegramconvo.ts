// telegramconvo.ts
import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const chatId = process.env.TELEGRAM_CHAT_ID!;

// Startup message
bot.start((ctx) => ctx.reply('Trading bot connected!'));
bot.telegram.sendMessage(chatId, "Telegram bot connected and ready!").catch(console.error);

// Helper function for notifications
export async function sendTelegramNotification(message: string): Promise<void> {
  try {
    await bot.telegram.sendMessage(chatId, message);
    console.log("Telegram notification sent:", message);
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

// Export bot instance
export default bot;

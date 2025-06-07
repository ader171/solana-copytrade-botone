// src/utils/telegram.ts

import fetch from 'node-fetch';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../config/constants';

export async function notify(msg: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg }),
    headers: { 'Content-Type': 'application/json' },
  });
}


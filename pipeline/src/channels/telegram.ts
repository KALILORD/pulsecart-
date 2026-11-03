import { env } from "../config";
import { postJson } from "../lib/http";
import type { SocialPost } from "../types";

interface TelegramResponse {
  ok?: boolean;
  description?: string;
  result?: { message_id?: number };
}

export async function publishTelegram(post: SocialPost): Promise<string> {
  if (!env.telegramBotToken || !env.telegramChatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  }

  const endpoint = post.imageUrl ? "sendPhoto" : "sendMessage";
  const body = post.imageUrl
    ? {
        chat_id: env.telegramChatId,
        photo: post.imageUrl,
        caption: post.text.slice(0, 1024),
      }
    : {
        chat_id: env.telegramChatId,
        text: post.text,
        disable_web_page_preview: false,
      };

  const response = await postJson<TelegramResponse>(
    `https://api.telegram.org/bot${env.telegramBotToken}/${endpoint}`,
    body,
  );

  if (!response?.ok) throw new Error(response?.description ?? "Telegram rejected the post");
  return String(response.result?.message_id ?? "");
}

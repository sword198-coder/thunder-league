import { logger } from "@/lib/logger";
import type { DiscordPayload } from "@/types";

const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;

export async function sendDiscordNotification(
  title: string,
  description: string,
  fields?: Array<{ name: string; value: string; inline?: boolean }>,
  color = 0x2563eb
): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    logger.warn("discordService: No webhook URL configured");
    return false;
  }

  try {
    const payload: DiscordPayload = {
      username: "Thunder League",
      embeds: [
        {
          title,
          description,
          color,
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error("discordService: webhook failed", { status: response.status });
      return false;
    }

    logger.info("discordService: notification sent", { title });
    return true;
  } catch (err) {
    logger.error("discordService: webhook error", err);
    return false;
  }
}

export async function notifyTournamentPublished(
  name: string,
  startDate: string,
  prizePool: string,
  tournamentUrl: string
): Promise<boolean> {
  return sendDiscordNotification(
    "🏆 New Tournament Open",
    `**${name}** is now open for registration!`,
    [
      { name: "Start Date", value: startDate, inline: true },
      ...(prizePool ? [{ name: "Prize Pool", value: prizePool, inline: true }] : []),
      { name: "Register", value: tournamentUrl, inline: false },
    ],
    0x2563eb
  );
}

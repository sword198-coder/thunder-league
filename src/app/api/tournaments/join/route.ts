import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { processJoinRequest } from "@/lib/tournamentManager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerName, preferredTier, playerCountry, playerVehicleType, playerVehicleTier } = body;

    if (!playerName) {
      return NextResponse.json(
        { error: "playerName is required" },
        { status: 400 }
      );
    }

    logger.info("API: Join tournament request", { playerName, preferredTier });

    const result = processJoinRequest({
      playerName,
      preferredTier,
      playerCountry,
      playerVehicleType,
      playerVehicleTier,
    });

    return NextResponse.json({
      success: true,
      tournament: result.tournament,
      notifications: result.notifications,
      drawBotSteps: result.drawBotSteps ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    logger.error("API: Join tournament failed", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

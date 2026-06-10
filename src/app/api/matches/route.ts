import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournament_id");
  if (!tournamentId) {
    return NextResponse.json({ matches: [] });
  }

  const admin = getAdminClient();
  const { data } = await admin
    .from("matches")
    .select("id, round, position, match_number, status, scheduled_time, player1_name, player2_name, winner")
    .eq("tournament_id", tournamentId)
    .order("match_number", { ascending: true });

  const matches = (data ?? []).map((m) => ({
    id: m.id,
    matchNumber: m.match_number,
    round: m.round,
    position: m.position,
    status: m.status,
    scheduledTime: m.scheduled_time,
    player1: m.player1_name,
    player2: m.player2_name,
    winner: m.winner,
  }));

  return NextResponse.json({ matches });
}

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

export async function uploadTournamentBanner(
  tournamentId: string,
  file: File
): Promise<string | null> {
  const supabase = createBrowserClient();

  const ext = file.name.split(".").pop() || "png";
  const filePath = `${tournamentId}/banner-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("tournament-banners")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    logger.error("bannerService: upload failed", { error: uploadError.message });
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("tournament-banners")
    .getPublicUrl(filePath);

  const bannerUrl = publicUrl.publicUrl;
  logger.info("bannerService: banner uploaded", { tournamentId, bannerUrl });
  return bannerUrl;
}

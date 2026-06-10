import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("FULL SUPABASE ERROR (getProfile):", error);
    logger.error("profileService: getProfile failed", error);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: { username?: string; avatar_url?: string | null }
): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("FULL SUPABASE ERROR (updateProfile):", error);
    logger.error("profileService: updateProfile failed", error);
    return false;
  }
  logger.info("profileService: profile updated", { userId, updates });
  return true;
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createBrowserClient();

  const ext = file.name.split(".").pop() || "png";
  const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("FULL SUPABASE ERROR (uploadAvatar):", uploadError);
    logger.error("profileService: uploadAvatar failed", uploadError);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = publicUrl.publicUrl;

  const updated = await updateProfile(userId, { avatar_url: avatarUrl });
  if (!updated) return null;

  logger.info("profileService: avatar uploaded", { userId, avatarUrl });
  return avatarUrl;
}

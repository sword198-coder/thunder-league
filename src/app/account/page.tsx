"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/supabase/session-provider";
import { getProfile, updateProfile, uploadAvatar } from "@/lib/services/profileService";

export default function AccountPage() {
  const { user, loading: authLoading } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    getProfile(user.id).then((profile) => {
      if (profile) {
        setUsername(profile.username);
        setAvatarUrl(profile.avatar_url);
      }
    }).catch(() => {}).finally(() => setProfileLoading(false));
  }, [user]);

  const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 2MB" });
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setMessage({ type: "error", text: "Only PNG, JPEG, GIF, or WebP images are allowed" });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMessage(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!user || !fileInputRef.current?.files?.[0]) return;
    setUploading(true);
    setMessage(null);

    const url = await uploadAvatar(user.id, fileInputRef.current.files[0]);
    if (url) {
      setAvatarUrl(url);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Avatar updated successfully" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      console.error("Account: uploadAvatar returned null");
      setMessage({ type: "error", text: "Failed to upload avatar" });
    }
    setUploading(false);
  }, [user]);

  const handleSaveUsername = useCallback(async () => {
    if (!user || !username.trim()) return;
    setSaving(true);
    setMessage(null);

    const ok = await updateProfile(user.id, { username: username.trim() });
    if (ok) {
      setMessage({ type: "success", text: "Username updated successfully" });
    } else {
      setMessage({ type: "error", text: "Failed to update username" });
    }
    setSaving(false);
  }, [user, username]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">My Account</h1>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-white shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface border border-border">
              {(previewUrl || avatarUrl) ? (
                <img
                  src={previewUrl || avatarUrl!}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-primary/30">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleAvatarSelect}
                className="text-sm text-primary/60 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-secondary/90 cursor-pointer"
              />
              {previewUrl && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="text-sm font-medium text-secondary hover:text-secondary/80 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Save Avatar"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-primary">Profile Information</h2>

          <div>
            <label className="block text-sm font-medium text-primary/60 mb-1">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface/50 text-primary/50 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary/60 mb-1">Username</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-shadow"
                placeholder="Your username"
              />
              <button
                onClick={handleSaveUsername}
                disabled={saving || !username.trim()}
                className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary mb-2">Account Details</h2>
          <div className="text-sm text-primary/60 space-y-1">
            <p>Member since: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</p>
            <p>Email verified: {user.email_confirmed_at ? "Yes" : "No"}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

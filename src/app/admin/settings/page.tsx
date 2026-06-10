"use client";

import { useState, useEffect } from "react";
import { saveSiteSettingAction } from "@/lib/actions/adminActions";

interface SettingRow {
  id: string;
  key: string;
  value: string;
}

const SETTING_LABELS: Record<string, string> = {
  site_name: "Site Name",
  site_description: "Site Description",
  discord_invite: "Discord Invite URL",
  maintenance_mode: "Maintenance Mode (true/false)",
  contact_email: "Contact Email",
  max_tournament_players: "Max Players per Tournament",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const res = await fetch("/api/site-settings");
    const data = await res.json();
    setSettings(data.settings ?? []);
    setLoading(false);
  }

  async function handleSave(key: string, value: string) {
    setSaving(key);
    setMessage("");
    const result = await saveSiteSettingAction(key, value);
    if (result.success) {
      setMessage(`Saved: ${key}`);
      loadSettings();
    } else {
      setMessage(result.error || "Failed to save");
    }
    setSaving(null);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Site Settings</h1>
        <p className="text-primary/60 mt-1">Manage global site settings</p>
      </div>

      {message && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-blue-50 border border-blue-200 text-blue-800">{message}</div>
      )}

      {loading ? (
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      ) : (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Setting</th>
                <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settings.map((s) => (
                <SettingRowComponent
                  key={s.id}
                  setting={s}
                  label={SETTING_LABELS[s.key] || s.key}
                  saving={saving === s.key}
                  onSave={handleSave}
                />
              ))}
              {settings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-primary/40">No settings found. Add them in the database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingRowComponent({ setting, label, saving, onSave }: {
  setting: SettingRow;
  label: string;
  saving: boolean;
  onSave: (key: string, value: string) => void;
}) {
  const [value, setValue] = useState(setting.value);

  return (
    <tr className="hover:bg-surface/50 transition-colors">
      <td className="px-4 py-3 font-medium text-primary">{label}</td>
      <td className="px-4 py-3 text-primary/40 text-xs font-mono">{setting.key}</td>
      <td className="px-4 py-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-1.5 rounded border border-border bg-white text-sm text-primary"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onSave(setting.key, value)}
          disabled={saving || value === setting.value}
          className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-medium hover:bg-secondary/90 disabled:opacity-50"
        >
          {saving ? "..." : "Save"}
        </button>
      </td>
    </tr>
  );
}

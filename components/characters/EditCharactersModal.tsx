"use client";

import { useCallback, useEffect, useState } from "react";
import type { CharacterProfileApiRow } from "@/lib/character-profiles/api-types";
import type { OfficialCharacterKey } from "@/lib/character-profiles/types";

type EditCharactersModalProps = {
  onClose: () => void;
};

type PendingNav =
  | { kind: "switch"; key: OfficialCharacterKey }
  | { kind: "close" }
  | null;

const actionButtonClass =
  "rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  "rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

export function EditCharactersModal({ onClose }: EditCharactersModalProps) {
  const [profiles, setProfiles] = useState<CharacterProfileApiRow[]>([]);
  const [selectedKey, setSelectedKey] = useState<OfficialCharacterKey | null>(null);
  const [appearance, setAppearance] = useState("");
  const [personality, setPersonality] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingNav, setPendingNav] = useState<PendingNav>(null);

  const applySelection = useCallback((list: CharacterProfileApiRow[], key: OfficialCharacterKey) => {
    const profile = list.find((p) => p.character_key === key);
    if (!profile) return;
    setSelectedKey(key);
    setAppearance(profile.appearance_description);
    setPersonality(profile.personality_description);
  }, []);

  const isCurrentCharacterDirty = useCallback(() => {
    if (!selectedKey) return false;
    const saved = profiles.find((p) => p.character_key === selectedKey);
    if (!saved) return false;
    return (
      appearance !== saved.appearance_description ||
      personality !== saved.personality_description
    );
  }, [appearance, personality, profiles, selectedKey]);

  const completePendingNav = useCallback(
    (nav: NonNullable<PendingNav>, list: CharacterProfileApiRow[]) => {
      if (nav.kind === "switch") {
        applySelection(list, nav.key);
        setStatusMessage(null);
        setError(null);
      } else {
        onClose();
      }
      setPendingNav(null);
    },
    [applySelection, onClose]
  );

  const requestSelectCharacter = useCallback(
    (key: OfficialCharacterKey) => {
      if (key === selectedKey || busy) return;
      if (!isCurrentCharacterDirty()) {
        applySelection(profiles, key);
        setStatusMessage(null);
        setError(null);
        return;
      }
      setPendingNav({ kind: "switch", key });
    },
    [applySelection, busy, isCurrentCharacterDirty, profiles, selectedKey]
  );

  const requestClose = useCallback(() => {
    if (busy) return;
    if (!isCurrentCharacterDirty()) {
      onClose();
      return;
    }
    setPendingNav({ kind: "close" });
  }, [busy, isCurrentCharacterDirty, onClose]);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/character-profiles");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to load character profiles.");
        return;
      }

      const list = (data.profiles ?? []) as CharacterProfileApiRow[];
      setProfiles(list);

      if (list.length > 0) {
        const key = selectedKey ?? list[0].character_key;
        const stillExists = list.some((p) => p.character_key === key);
        applySelection(list, stillExists ? key : list[0].character_key);
      }
    } catch {
      setError("Failed to load character profiles.");
    } finally {
      setLoading(false);
    }
  }, [applySelection, selectedKey]);

  useEffect(() => {
    void loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on open
  }, []);

  async function handleSave(): Promise<{
    ok: true;
    profiles: CharacterProfileApiRow[];
  } | { ok: false }> {
    if (!selectedKey || busy) return { ok: false };

    setBusy(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/character-profiles/${selectedKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance_description: appearance,
          personality_description: personality,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save character profile.");
        return { ok: false };
      }

      const updated = data.profile as CharacterProfileApiRow;
      const nextProfiles = profiles.map((p) =>
        p.character_key === updated.character_key ? updated : p
      );
      setProfiles(nextProfiles);
      setAppearance(updated.appearance_description);
      setPersonality(updated.personality_description);
      setStatusMessage("Saved");
      return { ok: true, profiles: nextProfiles };
    } catch {
      setError("Failed to save character profile.");
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }

  async function handleUnsavedSave() {
    if (!pendingNav) return;
    const nav = pendingNav;
    const result = await handleSave();
    if (result.ok) {
      completePendingNav(nav, result.profiles);
    }
  }

  function handleUnsavedDiscard() {
    if (!pendingNav) return;
    completePendingNav(pendingNav, profiles);
  }

  function handleUnsavedCancel() {
    setPendingNav(null);
  }

  async function handleResetOne() {
    if (!selectedKey || busy) return;

    setBusy(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/character-profiles/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character_key: selectedKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to reset character.");
        return;
      }

      const list = (data.profiles ?? []) as CharacterProfileApiRow[];
      setProfiles(list);
      applySelection(list, selectedKey);
      setStatusMessage("Reset to factory default");
    } catch {
      setError("Failed to reset character.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetAll() {
    if (busy) return;

    const confirmed = window.confirm(
      "Reset all seven official characters to factory defaults? This cannot be undone."
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/character-profiles/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to reset all characters.");
        return;
      }

      const list = (data.profiles ?? []) as CharacterProfileApiRow[];
      setProfiles(list);
      if (list.length > 0) {
        const key = selectedKey && list.some((p) => p.character_key === selectedKey)
          ? selectedKey
          : list[0].character_key;
        applySelection(list, key);
      }
      setStatusMessage("All characters reset to factory defaults");
    } catch {
      setError("Failed to reset all characters.");
    } finally {
      setBusy(false);
    }
  }

  const selectedDisplayName =
    profiles.find((p) => p.character_key === selectedKey)?.display_name ?? "this character";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={() => {
        if (pendingNav) return;
        requestClose();
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-characters-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-characters-title" className="text-lg font-semibold">
          Edit Characters
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Changes affect future stories only. Existing saved stories are not rewritten.
        </p>

        {loading && (
          <p className="mt-6 text-sm text-gray-500" role="status">
            Loading characters…
          </p>
        )}

        {!loading && error && !profiles.length && (
          <p className="mt-6 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {!loading && profiles.length > 0 && (
          <div className="mt-6 flex flex-col gap-6 sm:flex-row">
            <ul className="flex shrink-0 flex-row flex-wrap gap-2 sm:w-36 sm:flex-col">
              {profiles.map((profile) => (
                <li key={profile.character_key}>
                  <button
                    type="button"
                    onClick={() => requestSelectCharacter(profile.character_key)}
                    disabled={busy}
                    className={`w-full rounded border px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                      selectedKey === profile.character_key
                        ? "border-gray-900 bg-gray-100 font-medium"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {profile.display_name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="min-w-0 flex-1">
              <label className="block text-xs font-medium text-gray-500">
                Appearance
              </label>
              <textarea
                value={appearance}
                onChange={(e) => {
                  setAppearance(e.target.value);
                  setStatusMessage(null);
                }}
                rows={5}
                disabled={busy}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm leading-relaxed text-gray-700 focus:border-gray-500 focus:outline-none disabled:opacity-50"
              />

              <label className="mt-4 block text-xs font-medium text-gray-500">
                Personality
              </label>
              <textarea
                value={personality}
                onChange={(e) => {
                  setPersonality(e.target.value);
                  setStatusMessage(null);
                }}
                rows={4}
                disabled={busy}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm leading-relaxed text-gray-700 focus:border-gray-500 focus:outline-none disabled:opacity-50"
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={busy || !selectedKey}
                  className={primaryButtonClass}
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleResetOne()}
                  disabled={busy || !selectedKey}
                  className={actionButtonClass}
                >
                  Reset this character
                </button>
                <button
                  type="button"
                  onClick={() => void handleResetAll()}
                  disabled={busy}
                  className={actionButtonClass}
                >
                  Reset all characters
                </button>
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={busy}
                  className={actionButtonClass}
                >
                  Close
                </button>
              </div>

              {statusMessage && (
                <p className="mt-2 text-xs text-green-700" role="status">
                  {statusMessage}
                </p>
              )}
              {error && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {pendingNav && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 p-4"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="unsaved-changes-title"
              aria-describedby="unsaved-changes-desc"
              className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
            >
              <h3 id="unsaved-changes-title" className="text-sm font-semibold text-gray-900">
                Unsaved changes
              </h3>
              <p id="unsaved-changes-desc" className="mt-2 text-sm text-gray-600">
                You have unsaved changes to <strong>{selectedDisplayName}</strong>. Save or
                discard before continuing?
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleUnsavedSave()}
                  disabled={busy}
                  className={primaryButtonClass}
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleUnsavedDiscard}
                  disabled={busy}
                  className={actionButtonClass}
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleUnsavedCancel}
                  disabled={busy}
                  className={actionButtonClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRACKS, type TrackId } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface LookupResult {
  team_id: string;
  team_number: number | null;
  team_name: string;
  current_track: TrackId | null;
  current_deck_filename: string | null;
  current_deck_uploaded_at: string | null;
  member_full_name: string;
}

const ALLOWED_EXT = [".pdf", ".pptx", ".ppt"];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export function DeclareTrackForm() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"lookup" | "manage">("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<LookupResult | null>(null);

  // Track state
  const [pickedTrack, setPickedTrack] = useState<TrackId | null>(null);
  const [trackSaved, setTrackSaved] = useState(false);
  const [savingTrack, setSavingTrack] = useState(false);

  // Deck state
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [uploadingDeck, setUploadingDeck] = useState(false);
  const [deckSaved, setDeckSaved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/declare-track/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lookup failed");
        return;
      }
      setTeam(data);
      setPickedTrack(data.current_track ?? null);
      setStep("manage");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTrack() {
    if (!team || !pickedTrack) return;
    setError(null);
    setSavingTrack(true);
    try {
      const res = await fetch("/api/declare-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: team.team_id, track: pickedTrack, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        return;
      }
      setTrackSaved(true);
      setTeam({ ...team, current_track: pickedTrack });
    } catch {
      setError("Network error");
    } finally {
      setSavingTrack(false);
    }
  }

  async function handleUploadDeck() {
    if (!team || !deckFile) return;
    setError(null);
    setUploadingDeck(true);
    setUploadProgress("Requesting upload URL…");
    try {
      // Validate file
      const ext = deckFile.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      if (!ext || !ALLOWED_EXT.includes(ext)) {
        setError("Only .pdf, .pptx, or .ppt files are allowed.");
        return;
      }
      if (deckFile.size > MAX_BYTES) {
        setError("File is too large (max 50 MB).");
        return;
      }

      // 1. Ask the server for a signed upload URL
      const signRes = await fetch("/api/declare-track/sign-deck-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: team.team_id,
          email: email.trim(),
          filename: deckFile.name,
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) {
        setError(signData.error || "Could not get upload URL");
        return;
      }

      // 2. Upload the file directly to Supabase Storage using the signed URL
      setUploadProgress("Uploading…");
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("team-decks")
        .uploadToSignedUrl(signData.path, signData.token, deckFile, {
          contentType: deckFile.type || undefined,
        });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      // 3. Confirm with the server so it saves the deck path on the team
      setUploadProgress("Saving…");
      const confirmRes = await fetch("/api/declare-track/confirm-deck-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: team.team_id,
          email: email.trim(),
          storage_path: signData.path,
          filename: deckFile.name,
        }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        setError(confirmData.error || "Could not confirm upload");
        return;
      }

      setDeckSaved(true);
      setTeam({
        ...team,
        current_deck_filename: deckFile.name,
        current_deck_uploaded_at: new Date().toISOString(),
      });
      setDeckFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setUploadingDeck(false);
      setUploadProgress(null);
    }
  }

  if (step === "lookup") {
    return (
      <form onSubmit={handleLookup}>
        <Input
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
        />
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <Button type="submit" disabled={loading || !email} className="mt-5 w-full">
          {loading ? "Looking up..." : "Find My Team"}
        </Button>
      </form>
    );
  }

  if (!team) return null;

  return (
    <div>
      {/* Team header */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Hi, {team.member_full_name} —</p>
        <p className="mt-1 text-base font-semibold text-gray-900">
          {team.team_number != null && (
            <span className="text-emerald-700">#{team.team_number} </span>
          )}
          {team.team_name}
        </p>
      </div>

      {/* Track section */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">1. Pick your track</h3>
          {team.current_track && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Declared
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          {TRACKS.map((t) => {
            const selected = pickedTrack === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPickedTrack(t.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                  selected
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-900">{t.title}</p>
                <p className="text-sm italic text-gray-500">{t.subtitle}</p>
              </button>
            );
          })}
        </div>
        <Button
          onClick={handleSaveTrack}
          disabled={savingTrack || !pickedTrack || pickedTrack === team.current_track}
          className="mt-4 w-full"
        >
          {savingTrack
            ? "Saving..."
            : pickedTrack === team.current_track && team.current_track
            ? "Track already saved"
            : "Save track"}
        </Button>
        {trackSaved && (
          <p className="mt-2 text-center text-sm text-emerald-700">✓ Track saved</p>
        )}
      </div>

      {/* Deck section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">2. Upload your deck</h3>
          {team.current_deck_filename && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Uploaded
            </span>
          )}
        </div>
        {team.current_deck_filename && (
          <p className="mb-3 text-sm text-gray-600">
            Current: <span className="font-medium">{team.current_deck_filename}</span>
            {team.current_deck_uploaded_at && (
              <span className="text-gray-400">
                {" "}
                ({new Date(team.current_deck_uploaded_at).toLocaleString()})
              </span>
            )}
          </p>
        )}
        <p className="mb-3 text-xs text-gray-500">
          PDF, PowerPoint (.pptx), or Keynote-exported PDF. Max 50 MB. Uploading
          a new deck replaces the current one.
        </p>
        <input
          type="file"
          accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
          onChange={(e) => setDeckFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
        />
        {deckFile && (
          <p className="mt-2 text-xs text-gray-500">
            Selected: {deckFile.name} ({(deckFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        )}
        <Button
          onClick={handleUploadDeck}
          disabled={uploadingDeck || !deckFile}
          className="mt-4 w-full"
        >
          {uploadingDeck ? uploadProgress ?? "Uploading..." : "Upload Deck"}
        </Button>
        {deckSaved && (
          <p className="mt-2 text-center text-sm text-emerald-700">✓ Deck saved</p>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => {
            setStep("lookup");
            setEmail("");
            setTeam(null);
            setPickedTrack(null);
            setTrackSaved(false);
            setDeckSaved(false);
            setDeckFile(null);
            setError(null);
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Look up another team
        </button>
      </div>
    </div>
  );
}

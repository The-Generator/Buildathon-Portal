import { createAdminClient } from "@/lib/supabase/admin";
import { DecksBrowser, type TeamWithDeck } from "./decks-browser";

export const dynamic = "force-dynamic";

export default async function AdminDecksPage() {
  const supabase = createAdminClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, team_number, name, room_number, track, deck_filename, deck_uploaded_at")
    .order("team_number", { ascending: true, nullsFirst: false });

  const { data: participants } = await supabase
    .from("participants")
    .select("id, full_name, email, team_id")
    .not("team_id", "is", null)
    .neq("participant_type", "spectator");

  const membersByTeam = new Map<string, Array<{ id: string; full_name: string; email: string }>>();
  for (const p of participants ?? []) {
    if (!p.team_id) continue;
    const arr = membersByTeam.get(p.team_id) ?? [];
    arr.push({ id: p.id, full_name: p.full_name, email: p.email });
    membersByTeam.set(p.team_id, arr);
  }

  const teamsWithDeck: TeamWithDeck[] = (teams ?? []).map((t) => ({
    id: t.id,
    team_number: t.team_number ?? null,
    name: t.name,
    room_number: t.room_number ?? null,
    track: t.track ?? null,
    deck_filename: t.deck_filename ?? null,
    deck_uploaded_at: t.deck_uploaded_at ?? null,
    members: membersByTeam.get(t.id) ?? [],
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Decks & Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search for a team&apos;s submitted pitch deck by team number or member name.
        </p>
      </div>
      <DecksBrowser teams={teamsWithDeck} />
    </div>
  );
}

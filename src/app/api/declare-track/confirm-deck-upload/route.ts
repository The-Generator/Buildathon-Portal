import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  team_id: z.string().uuid(),
  email: z.string().email(),
  storage_path: z.string().min(1),
  filename: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify the email belongs to a member of the team
    const { data: participant } = await supabase
      .from("participants")
      .select("id, team_id")
      .ilike("email", parsed.data.email)
      .maybeSingle();
    if (!participant || participant.team_id !== parsed.data.team_id) {
      return NextResponse.json({ error: "You're not on this team." }, { status: 403 });
    }

    // Verify the file actually exists in storage at the expected path
    const folder = `teams/${parsed.data.team_id}`;
    const filename = parsed.data.storage_path.split("/").pop();
    const { data: files, error: listError } = await supabase.storage
      .from("team-decks")
      .list(folder);
    if (listError) {
      return NextResponse.json(
        { error: "Could not verify upload", details: listError.message },
        { status: 500 }
      );
    }
    const found = (files ?? []).some((f) => f.name === filename);
    if (!found) {
      return NextResponse.json(
        { error: "Upload not found in storage. Please try again." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("teams")
      .update({
        deck_storage_path: parsed.data.storage_path,
        deck_filename: parsed.data.filename,
        deck_uploaded_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.team_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Could not save deck info", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

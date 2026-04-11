import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_EXTS = ["pdf", "pptx", "ppt"] as const;

const schema = z.object({
  team_id: z.string().uuid(),
  email: z.string().email(),
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

    // Validate file extension
    const ext = parsed.data.filename.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])) {
      return NextResponse.json(
        { error: "File must be a .pdf, .pptx, or .ppt" },
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
      return NextResponse.json(
        { error: "You're not on this team." },
        { status: 403 }
      );
    }

    // Storage path: teams/{team_id}/deck.{ext}
    // We always overwrite the existing deck for the team (one deck per team).
    const storagePath = `teams/${parsed.data.team_id}/deck.${ext}`;

    // Remove any existing object at that path so the new upload doesn't conflict.
    await supabase.storage.from("team-decks").remove([
      `teams/${parsed.data.team_id}/deck.pdf`,
      `teams/${parsed.data.team_id}/deck.pptx`,
      `teams/${parsed.data.team_id}/deck.ppt`,
    ]);

    // Generate a signed upload URL valid for 5 minutes
    const { data: signed, error: signError } = await supabase.storage
      .from("team-decks")
      .createSignedUploadUrl(storagePath);

    if (signError || !signed) {
      return NextResponse.json(
        { error: "Could not generate upload URL", details: signError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signed_url: signed.signedUrl,
      token: signed.token,
      path: storagePath,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

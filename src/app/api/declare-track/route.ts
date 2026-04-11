import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const TRACK_VALUES = [
  "athletic_performance",
  "accessibility_solutions",
  "entrepreneurial_ai",
] as const;

const schema = z.object({
  team_id: z.string().uuid(),
  track: z.enum(TRACK_VALUES),
  email: z.string().email(),
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

    // Verify the email belongs to a member of this team (prevents random people
    // overwriting tracks for teams they're not on).
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

    const { error: updateError } = await supabase
      .from("teams")
      .update({ track: parsed.data.track })
      .eq("id", parsed.data.team_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Could not save track", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

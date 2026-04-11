import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: team, error } = await supabase
    .from("teams")
    .select("deck_storage_path, deck_filename")
    .eq("id", id)
    .single();

  if (error || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
  if (!team.deck_storage_path) {
    return NextResponse.json({ error: "No deck uploaded" }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("team-decks")
    .createSignedUrl(team.deck_storage_path, 60 * 5, {
      download: team.deck_filename ?? true,
    });

  if (signError || !signed) {
    return NextResponse.json(
      { error: "Could not generate download URL", details: signError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: signed.signedUrl,
    filename: team.deck_filename,
  });
}

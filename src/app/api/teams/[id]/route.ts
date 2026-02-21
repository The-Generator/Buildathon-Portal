import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

async function verifyAdmin() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const supabase = createAdminClient();

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", token)
    .single();

  if (error || !admin) {
    return null;
  }

  return admin;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", id);

    if (membersError) {
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ...team,
        members: members ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin auth
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "is_complete",
      "is_locked",
      "project_name",
      "project_description",
      "formation_type",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updatedTeam, error: updateError } = await supabase
      .from("teams")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedTeam) {
      return NextResponse.json(
        { error: "Failed to update team", details: updateError?.message },
        { status: 500 }
      );
    }

    // Fetch members to return complete team info
    const { data: members } = await supabase
      .from("participants")
      .select("*")
      .eq("team_id", id);

    return NextResponse.json(
      {
        ...updatedTeam,
        members: members ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

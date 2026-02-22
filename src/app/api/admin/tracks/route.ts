import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("event_config")
      .select("track_released, updated_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch track release state" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      track_released: data.track_released,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.error("Admin tracks GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Read current state
    const { data: current, error: readError } = await supabase
      .from("event_config")
      .select("id, track_released")
      .single();

    if (readError || !current) {
      return NextResponse.json(
        { error: "Failed to read track release state" },
        { status: 500 }
      );
    }

    // Toggle
    const { data: updated, error: updateError } = await supabase
      .from("event_config")
      .update({ track_released: !current.track_released })
      .eq("id", current.id)
      .select("track_released, updated_at")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "Failed to toggle track release state" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      track_released: updated.track_released,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    console.error("Admin tracks POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

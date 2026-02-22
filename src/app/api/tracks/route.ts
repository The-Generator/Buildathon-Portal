import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_CONFIG } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("event_config")
      .select("track_released")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch track information" },
        { status: 500 }
      );
    }

    if (!data.track_released) {
      return NextResponse.json({
        released: false,
        message: "Track and theme details will be announced closer to the event. Stay tuned!",
      });
    }

    return NextResponse.json({
      released: true,
      theme: EVENT_CONFIG.theme,
    });
  } catch (error) {
    console.error("Tracks GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

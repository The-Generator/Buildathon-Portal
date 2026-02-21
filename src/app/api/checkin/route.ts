import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  // Remove timestamps outside the window
  const recentTimestamps = timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, recentTimestamps);
    return true;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "Please provide an email or phone number." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();
    const supabase = createAdminClient();

    // Look up participant by email OR phone
    const { data: participant, error: lookupError } = await supabase
      .from("participants")
      .select("*")
      .or(`email.eq.${trimmedIdentifier},phone.eq.${trimmedIdentifier}`)
      .single();

    if (lookupError || !participant) {
      return NextResponse.json(
        {
          error:
            "No registration found for this email or phone number. Please check and try again.",
        },
        { status: 404 }
      );
    }

    // If already checked in, return existing check-in info
    if (participant.checked_in) {
      return NextResponse.json(
        {
          message: "Already checked in",
          participant: {
            id: participant.id,
            full_name: participant.full_name,
            email: participant.email,
            school: participant.school,
            tshirt_size: participant.tshirt_size,
            checked_in: true,
            checked_in_at: participant.checked_in_at,
          },
        },
        { status: 200 }
      );
    }

    // Update check-in status
    const { data: updatedParticipant, error: updateError } = await supabase
      .from("participants")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", participant.id)
      .select()
      .single();

    if (updateError || !updatedParticipant) {
      return NextResponse.json(
        { error: "Failed to check in. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Check-in successful!",
        participant: {
          id: updatedParticipant.id,
          full_name: updatedParticipant.full_name,
          email: updatedParticipant.email,
          school: updatedParticipant.school,
          tshirt_size: updatedParticipant.tshirt_size,
          dietary_restrictions: updatedParticipant.dietary_restrictions,
          team_id: updatedParticipant.team_id,
          checked_in: true,
          checked_in_at: updatedParticipant.checked_in_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

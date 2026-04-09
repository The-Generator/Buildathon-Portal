import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email/send";
import { EVENT_CONFIG } from "@/lib/constants";
import CheckInReminder from "@/lib/email/templates/CheckInReminder";
import { z } from "zod";

const checkinEmailSchema = z.object({
  test_email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkinEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const checkinUrl = "https://babsonbuildathon.com/checkin";
    const supabase = createAdminClient();

    // Test mode: send to a single email
    if (parsed.data.test_email) {
      const result = await sendEmail({
        to: parsed.data.test_email,
        subject: `Check in early for ${EVENT_CONFIG.shortName}!`,
        react: createElement(CheckInReminder, {
          participantName: "Test Participant",
          checkinUrl,
        }),
      });

      return NextResponse.json(
        { sent: result.success ? 1 : 0, failed: result.success ? 0 : 1, test: true },
        { status: 200 }
      );
    }

    // Production mode: send to all participants (not spectators)
    const { data: participants, error: fetchError } = await supabase
      .from("participants")
      .select("id, full_name, email")
      .neq("participant_type", "spectator");

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch participants", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { sent: 0, failed: 0 },
        { status: 200 }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const p of participants) {
      const result = await sendEmail({
        to: p.email,
        subject: `Check in early for ${EVENT_CONFIG.shortName}!`,
        react: createElement(CheckInReminder, {
          participantName: p.full_name,
          checkinUrl,
        }),
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Rate-limit: 200ms between sends to avoid hitting Resend limits
      await new Promise((r) => setTimeout(r, 200));
    }

    // Log the action
    await supabase.from("admin_actions").insert({
      admin_email: admin.email,
      action_type: "sent_checkin_reminder",
      details: {
        total_participants: participants.length,
        sent,
        failed,
      },
    });

    return NextResponse.json({ sent, failed }, { status: 200 });
  } catch (error) {
    console.error("Check-in email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

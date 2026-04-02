import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email/send";
import RegistrationConfirmation from "@/lib/email/templates/RegistrationConfirmation";
import { EVENT_CONFIG } from "@/lib/constants";

const resendSchema = z.object({
  participant_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: participant, error: fetchError } = await supabase
      .from("participants")
      .select("id, full_name, email, participant_type")
      .eq("id", parsed.data.participant_id)
      .single();

    if (fetchError || !participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Determine team option from registration group
    let teamOption: "solo" | "partial_team" | "spectator" = "solo";
    let groupSize = 1;

    if (participant.participant_type === "spectator") {
      teamOption = "spectator";
    } else {
      const { data: group } = await supabase
        .from("registration_groups")
        .select("group_size")
        .eq("registrant_id", participant.id)
        .single();

      if (group && group.group_size > 1) {
        teamOption = "partial_team";
        groupSize = group.group_size;
      }
    }

    const emailElement = createElement(RegistrationConfirmation, {
      participantName: participant.full_name,
      teamOption,
      groupSize,
      isRegisteredByOther: false,
    });

    const result = await sendEmail({
      to: participant.email,
      subject: `You're Registered for ${EVENT_CONFIG.shortName}!`,
      react: emailElement,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: String(result.error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, email: participant.email });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

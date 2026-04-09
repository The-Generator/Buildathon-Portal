import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email/send";
import TeamAssignment from "@/lib/email/templates/TeamAssignment";
import { EVENT_CONFIG } from "@/lib/constants";

const notifyRequestSchema = z
  .object({
    team_ids: z.array(z.string().uuid()).min(1).optional(),
    team_id: z.string().uuid().optional(),
    all_locked: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.all_locked === true ||
      !!data.team_id ||
      (Array.isArray(data.team_ids) && data.team_ids.length > 0),
    {
      message: "Provide team_id, team_ids, or all_locked: true",
      path: ["team_ids"],
    }
  );

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = notifyRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsedBody.data;
    const supabase = createAdminClient();

    // Determine which teams to notify
    let teamIds: string[];

    if (body.all_locked === true) {
      const { data: lockedTeams, error } = await supabase
        .from("teams")
        .select("id")
        .eq("is_locked", true);

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch locked teams", details: error.message },
          { status: 500 }
        );
      }

      teamIds = (lockedTeams ?? []).map((t: { id: string }) => t.id);
    } else if (Array.isArray(body.team_ids) && body.team_ids.length > 0) {
      teamIds = body.team_ids;
    } else if (body.team_id) {
      teamIds = [body.team_id];
    } else {
      return NextResponse.json(
        { error: "Provide team_id, team_ids array, or all_locked: true" },
        { status: 400 }
      );
    }

    teamIds = [...new Set(teamIds)];

    if (teamIds.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, errors: [] });
    }

    // Fetch teams with members
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, room_number, aggregate_skills")
      .in("id", teamIds);

    if (teamsError) {
      return NextResponse.json(
        { error: "Failed to fetch teams", details: teamsError.message },
        { status: 500 }
      );
    }

    const { data: participants, error: pError } = await supabase
      .from("participants")
      .select("id, team_id, full_name, email, phone, school, primary_role")
      .in("team_id", teamIds);

    if (pError) {
      return NextResponse.json(
        { error: "Failed to fetch participants", details: pError.message },
        { status: 500 }
      );
    }

    // Group participants by team
    const membersByTeam = new Map<
      string,
      Array<{ id: string; full_name: string; email: string; phone: string; school: string; primary_role: string }>
    >();
    for (const p of participants ?? []) {
      if (!p.team_id) continue;
      const existing = membersByTeam.get(p.team_id) ?? [];
      existing.push(p);
      membersByTeam.set(p.team_id, existing);
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send emails per team
    for (const team of teams ?? []) {
      const members = membersByTeam.get(team.id) ?? [];
      if (members.length === 0) continue;

      for (const member of members) {
        // Build teammates list (everyone except the current member)
        const teammates = members
          .filter((m) => m.id !== member.id)
          .map((m) => ({
            name: m.full_name,
            school: m.school || "Unknown",
            role: m.primary_role || "Participant",
            email: m.email,
            phone: m.phone || "",
          }));

        const emailElement = createElement(TeamAssignment, {
          participantName: member.full_name,
          teamName: team.name,
          roomNumber: team.room_number,
          teammates,
          teamSkills: team.aggregate_skills ?? [],
        });

        const result = await sendEmail({
          to: member.email,
          subject: `Your ${EVENT_CONFIG.shortName} Team: ${team.name}`,
          react: emailElement,
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`${member.email}: ${String(result.error)}`);
        }

        // Rate-limit: 200ms between sends to avoid hitting Resend limits
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Audit log
    const { error: auditError } = await supabase.from("admin_actions").insert({
      admin_email: admin.email,
      action_type: "sent_team_notifications",
      team_id: teamIds.length === 1 ? teamIds[0] : null,
      details: {
        team_count: teamIds.length,
        team_ids: teamIds,
        sent,
        failed,
        all_locked: body.all_locked === true,
      },
    });

    if (auditError) {
      failed++;
      errors.push(`Audit log failed: ${auditError.message}`);
    }

    return NextResponse.json({ sent, failed, errors });
  } catch (error) {
    console.error("Notify API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

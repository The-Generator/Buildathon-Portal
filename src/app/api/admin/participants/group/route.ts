import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const addToGroupSchema = z.object({
  participant_id: z.string().uuid(),
  registrant_id: z.string().uuid(),
});

const removeFromGroupSchema = z.object({
  participant_id: z.string().uuid(),
});

/**
 * Resolve the full group for a participant:
 * - If they're a lead (is_self_registered && has members), return lead + members
 * - If they're a member (registered_by set), return their lead + all members
 * - If solo, return just them
 */
async function resolveGroup(
  supabase: ReturnType<typeof createAdminClient>,
  participantId: string
): Promise<string[]> {
  const { data: p } = await supabase
    .from("participants")
    .select("id, is_self_registered, registered_by")
    .eq("id", participantId)
    .single();

  if (!p) return [participantId];

  // Determine the lead of this participant's group
  const leadId = p.is_self_registered ? p.id : p.registered_by ?? p.id;

  // Get all members registered under this lead
  const { data: members } = await supabase
    .from("participants")
    .select("id")
    .eq("registered_by", leadId);

  const ids = new Set<string>();
  ids.add(leadId);
  for (const m of members ?? []) {
    ids.add(m.id);
  }

  return [...ids];
}

/** POST - Add a participant (and their group) to a registration group */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addToGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { participant_id, registrant_id } = parsed.data;

    if (participant_id === registrant_id) {
      return NextResponse.json(
        { error: "Cannot add a participant to their own group" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Resolve the full source group (the participant being added + their existing group members)
    const sourceGroupIds = await resolveGroup(supabase, participant_id);

    // Resolve the target group
    const targetGroupIds = await resolveGroup(supabase, registrant_id);

    // Check for overlap
    const targetSet = new Set(targetGroupIds);
    if (sourceGroupIds.some((id) => targetSet.has(id))) {
      return NextResponse.json(
        { error: "These participants are already in the same group" },
        { status: 400 }
      );
    }

    const mergedSize = sourceGroupIds.length + targetGroupIds.length;
    if (mergedSize > 3) {
      return NextResponse.json(
        {
          error: `Merging would create a group of ${mergedSize}. Max is 3.`,
        },
        { status: 400 }
      );
    }

    // Get or create the target registrant's group record
    let targetGroup = await supabase
      .from("registration_groups")
      .select("id, group_size")
      .eq("registrant_id", registrant_id)
      .single()
      .then((r) => r.data);

    if (!targetGroup) {
      const { data: newGroup, error: createError } = await supabase
        .from("registration_groups")
        .insert({
          registrant_id,
          group_size: targetGroupIds.length,
          tagged_team_skills: [],
        })
        .select("id, group_size")
        .single();

      if (createError || !newGroup) {
        return NextResponse.json(
          { error: "Failed to create registration group" },
          { status: 500 }
        );
      }
      targetGroup = newGroup;
    }

    // Delete any registration_group records owned by source members
    for (const id of sourceGroupIds) {
      await supabase
        .from("registration_groups")
        .delete()
        .eq("registrant_id", id);
    }

    // Move all source members to point to the target registrant
    for (const id of sourceGroupIds) {
      await supabase
        .from("participants")
        .update({
          registered_by: registrant_id,
          is_self_registered: false,
        })
        .eq("id", id);
    }

    // Update target group size
    await supabase
      .from("registration_groups")
      .update({ group_size: mergedSize })
      .eq("id", targetGroup.id);

    return NextResponse.json({
      success: true,
      merged: sourceGroupIds.length,
      total: mergedSize,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE - Remove a participant from their registration group */
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = removeFromGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { participant_id } = parsed.data;
    const supabase = createAdminClient();

    const { data: participant, error: pError } = await supabase
      .from("participants")
      .select("id, registered_by")
      .eq("id", participant_id)
      .single();

    if (pError || !participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    if (!participant.registered_by) {
      return NextResponse.json(
        { error: "Participant is not in a registration group" },
        { status: 400 }
      );
    }

    const registrantId = participant.registered_by;

    // Remove from group: clear registered_by, restore self-registered status
    await supabase
      .from("participants")
      .update({
        registered_by: null,
        is_self_registered: true,
      })
      .eq("id", participant_id);

    // Decrement group size
    const { data: group } = await supabase
      .from("registration_groups")
      .select("id, group_size")
      .eq("registrant_id", registrantId)
      .single();

    if (group && group.group_size > 1) {
      await supabase
        .from("registration_groups")
        .update({ group_size: group.group_size - 1 })
        .eq("id", group.id);
    }

    // Create a new solo registration group for the removed participant
    await supabase.from("registration_groups").insert({
      registrant_id: participant_id,
      group_size: 1,
      tagged_team_skills: [],
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

/** POST - Add a participant to a registration group */
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

    // Verify the participant exists and isn't already in someone else's group
    const { data: participant, error: pError } = await supabase
      .from("participants")
      .select("id, registered_by, is_self_registered")
      .eq("id", participant_id)
      .single();

    if (pError || !participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.registered_by && participant.registered_by !== registrant_id) {
      return NextResponse.json(
        { error: "Participant is already in another registration group" },
        { status: 409 }
      );
    }

    // Get or create the registrant's group
    let group = await supabase
      .from("registration_groups")
      .select("id, group_size")
      .eq("registrant_id", registrant_id)
      .single()
      .then((r) => r.data);

    if (!group) {
      const { data: newGroup, error: createError } = await supabase
        .from("registration_groups")
        .insert({
          registrant_id,
          group_size: 1,
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
      group = newGroup;
    }

    if (group.group_size >= 3) {
      return NextResponse.json(
        { error: "Registration groups cannot exceed 3 members" },
        { status: 400 }
      );
    }

    // If the participant being added has their own registration group (solo),
    // delete it since they're joining someone else's group
    await supabase
      .from("registration_groups")
      .delete()
      .eq("registrant_id", participant_id);

    // Update participant: set registered_by and mark as not self-registered
    await supabase
      .from("participants")
      .update({
        registered_by: registrant_id,
        is_self_registered: false,
      })
      .eq("id", participant_id);

    // Increment group size
    await supabase
      .from("registration_groups")
      .update({ group_size: group.group_size + 1 })
      .eq("id", group.id);

    return NextResponse.json({ success: true });
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

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { PRIMARY_ROLES, SPECIFIC_SKILLS, EXPERIENCE_LEVELS, SCHOOLS, YEARS } from "@/lib/constants";

const createParticipantSchema = z
  .object({
    full_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    school: z.enum([...SCHOOLS] as [string, ...string[]]),
    school_other: z.string().optional(),
    year: z.enum([...YEARS] as [string, ...string[]]),
    primary_role: z.enum([...PRIMARY_ROLES] as [string, ...string[]]),
    specific_skills: z.array(z.string()).default([]),
    experience_level: z.enum([...EXPERIENCE_LEVELS] as [string, ...string[]]),
    ai_tools: z.array(z.string()).default([]),
    participant_type: z.enum(["participant", "spectator", "walk_in"]).default("walk_in"),
    checked_in: z.boolean().default(true),
  })
  .refine(
    (data) => data.school !== "Other" || (!!data.school_other && data.school_other.trim().length > 0),
    { message: "Please specify your school", path: ["school_other"] }
  );

const updateParticipantSchema = z.object({
  full_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  school: z.enum([...SCHOOLS] as [string, ...string[]]).optional(),
  school_other: z.string().optional(),
  year: z.enum([...YEARS] as [string, ...string[]]).optional(),
  primary_role: z.enum([...PRIMARY_ROLES] as [string, ...string[]]).optional(),
  specific_skills: z.array(z.enum([...SPECIFIC_SKILLS] as [string, ...string[]])).optional(),
  experience_level: z.enum([...EXPERIENCE_LEVELS] as [string, ...string[]]).optional(),
  ai_tools: z.array(z.string()).optional(),
});

// POST - Create new participant (admin walk-in registration)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createParticipantSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const data = result.data;

    // Check for duplicate email
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A participant with this email already exists" },
        { status: 409 }
      );
    }

    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        full_name: data.full_name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        school: data.school,
        school_other: data.school_other || null,
        year: data.year,
        primary_role: data.primary_role,
        specific_skills: data.specific_skills,
        experience_level: data.experience_level,
        ai_tools: data.ai_tools,
        participant_type: data.participant_type,
        is_self_registered: false,
        checked_in: data.checked_in,
        checked_in_at: data.checked_in ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create participant", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(participant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a participant and associated records
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Participant ID required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the participant to determine cleanup strategy
    const { data: participant, error: fetchError } = await supabase
      .from("participants")
      .select("id, is_self_registered, registered_by")
      .eq("id", id)
      .single();

    if (fetchError || !participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.is_self_registered) {
      // Self-registered: delete their teammates first, then registration group, then self
      const { data: teammates } = await supabase
        .from("participants")
        .select("id")
        .eq("registered_by", participant.id);

      for (const teammate of teammates ?? []) {
        await supabase.from("admin_actions").update({ participant_id: null }).eq("participant_id", teammate.id);
        await supabase.from("participants").delete().eq("id", teammate.id);
      }

      await supabase.from("registration_groups").delete().eq("registrant_id", participant.id);
      await supabase.from("admin_actions").update({ participant_id: null }).eq("participant_id", participant.id);
      await supabase.from("participants").delete().eq("id", participant.id);
    } else {
      // Non-self-registered (someone's teammate): delete and decrement parent group
      await supabase.from("admin_actions").update({ participant_id: null }).eq("participant_id", participant.id);
      await supabase.from("participants").delete().eq("id", participant.id);

      if (participant.registered_by) {
        const { data: group } = await supabase
          .from("registration_groups")
          .select("id, group_size")
          .eq("registrant_id", participant.registered_by)
          .single();

        if (group && group.group_size > 1) {
          await supabase
            .from("registration_groups")
            .update({ group_size: group.group_size - 1 })
            .eq("id", group.id);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update existing participant
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Participant ID required" }, { status: 400 });
    }

    const result = updateParticipantSchema.safeParse(fields);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = result.data;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: participant, error } = await supabase
      .from("participants")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update participant", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(participant, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

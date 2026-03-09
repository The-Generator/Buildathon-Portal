"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRIMARY_ROLES, SPECIFIC_SKILLS, EXPERIENCE_LEVELS, SCHOOLS, YEARS } from "@/lib/constants";
import type { Participant } from "@/types";

interface EditParticipantModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  participant: Participant;
  adminToken: string;
}

export function EditParticipantModal({
  open,
  onClose,
  onUpdated,
  participant,
  adminToken,
}: EditParticipantModalProps) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    school: "",
    school_other: "",
    year: "",
    primary_role: "",
    specific_skills: [] as string[],
    experience_level: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && participant) {
      setForm({
        full_name: participant.full_name,
        email: participant.email,
        phone: participant.phone,
        school: participant.school,
        school_other: participant.school_other || "",
        year: participant.year,
        primary_role: participant.primary_role,
        specific_skills: participant.specific_skills ?? [],
        experience_level: participant.experience_level,
      });
      setError(null);
    }
  }, [open, participant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          id: participant.id,
          ...form,
          school_other: form.school === "Other" ? form.school_other : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update participant");
        setSubmitting(false);
        return;
      }

      onUpdated();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      specific_skills: f.specific_skills.includes(skill)
        ? f.specific_skills.filter((s) => s !== skill)
        : [...f.specific_skills, skill],
    }));
  };

  const selectStyle =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006241] focus:border-[#006241]";

  return (
    <Modal open={open} onClose={onClose} title="Edit Participant" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
            <select
              value={form.school}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
              className={selectStyle}
            >
              <option value="">Select school</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {form.school === "Other" && (
            <Input
              label="School Name"
              value={form.school_other}
              onChange={(e) => setForm((f) => ({ ...f, school_other: e.target.value }))}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className={selectStyle}
            >
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Role</label>
            <select
              value={form.primary_role}
              onChange={(e) => setForm((f) => ({ ...f, primary_role: e.target.value }))}
              className={selectStyle}
            >
              <option value="">Select role</option>
              {PRIMARY_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              value={form.experience_level}
              onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))}
              className={selectStyle}
            >
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills ({form.specific_skills.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIFIC_SKILLS.map((skill) => {
              const selected = form.specific_skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selected
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

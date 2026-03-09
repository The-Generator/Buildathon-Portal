"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRIMARY_ROLES, SPECIFIC_SKILLS, EXPERIENCE_LEVELS, SCHOOLS, YEARS } from "@/lib/constants";

interface AddWalkinModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  adminToken: string;
}

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  school: "" as string,
  school_other: "",
  year: "" as string,
  primary_role: "" as string,
  specific_skills: [] as string[],
  experience_level: "" as string,
  ai_tools: [] as string[],
  checked_in: true,
};

export function AddWalkinModal({ open, onClose, onCreated, adminToken }: AddWalkinModalProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...form,
          participant_type: "walk_in",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create participant");
        setSubmitting(false);
        return;
      }

      onCreated();
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

  const isValid =
    form.full_name.length >= 2 &&
    form.email.includes("@") &&
    form.phone.length >= 10 &&
    form.school &&
    (form.school !== "Other" || form.school_other.trim().length > 0) &&
    form.year &&
    form.primary_role &&
    form.experience_level;

  return (
    <Modal open={open} onClose={onClose} title="Add Walk-in" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Phone *"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
            <select
              value={form.school}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
              className={selectStyle}
              required
            >
              <option value="">Select school</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {form.school === "Other" && (
            <Input
              label="School Name *"
              value={form.school_other}
              onChange={(e) => setForm((f) => ({ ...f, school_other: e.target.value }))}
              required
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <select
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className={selectStyle}
              required
            >
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Role & experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Role *</label>
            <select
              value={form.primary_role}
              onChange={(e) => setForm((f) => ({ ...f, primary_role: e.target.value }))}
              className={selectStyle}
              required
            >
              <option value="">Select role</option>
              {PRIMARY_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
            <select
              value={form.experience_level}
              onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))}
              className={selectStyle}
              required
            >
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills */}
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

        {/* Check-in toggle */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.checked_in}
            onChange={(e) => setForm((f) => ({ ...f, checked_in: e.target.checked }))}
            className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
          />
          <span className="text-gray-700">Mark as checked in</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !isValid}>
            {submitting ? "Adding..." : "Add Walk-in"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

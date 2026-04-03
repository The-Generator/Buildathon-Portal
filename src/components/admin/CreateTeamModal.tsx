"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Link2 } from "lucide-react";
import type { Participant } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  adminToken: string;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreated,
  adminToken,
}: CreateTeamModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [teamName, setTeamName] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnassigned = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("participants")
      .select("*")
      .is("team_id", null)
      .neq("participant_type", "spectator")
      .order("full_name", { ascending: true });

    setParticipants(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setTeamName("");
      setSearch("");
      setError(null);
      void fetchUnassigned();
    }
  }, [isOpen, fetchUnassigned]);

  // Build group membership: participant id → all group member ids (including self)
  const groupMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const byRegistrant = new Map<string, string[]>();

    // Group members by their registrant
    for (const p of participants) {
      const registrantId = p.is_self_registered ? p.id : p.registered_by;
      if (!registrantId) continue;
      const existing = byRegistrant.get(registrantId) ?? [];
      existing.push(p.id);
      byRegistrant.set(registrantId, existing);
    }

    // Map each participant to their full group
    for (const p of participants) {
      const registrantId = p.is_self_registered ? p.id : p.registered_by;
      if (!registrantId) {
        map.set(p.id, [p.id]);
        continue;
      }
      map.set(p.id, byRegistrant.get(registrantId) ?? [p.id]);
    }

    return map;
  }, [participants]);

  const toggleParticipant = (id: string) => {
    const groupIds = groupMap.get(id) ?? [id];
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isSelected = next.has(id);
      for (const gid of groupIds) {
        if (isSelected) {
          next.delete(gid);
        } else {
          next.add(gid);
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0 || selectedIds.size > 5) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: teamName.trim() || undefined,
          participant_ids: [...selectedIds],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = err.error || "Failed to create team";
        setError(err.details ? `${msg}: ${err.details}` : msg);
        return;
      }

      onCreated();
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = participants.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.primary_role.toLowerCase().includes(q)
    );
  });

  const canSubmit = selectedIds.size >= 1 && selectedIds.size <= 5 && !submitting;

  return (
    <Modal open={isOpen} onClose={onClose} title="Create Team">
      <div className="space-y-4">
        {/* Team name input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Auto-generated if left blank"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Selected count */}
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Select Participants
          </label>
          <Badge color={selectedIds.size > 5 ? "red" : selectedIds.size > 0 ? "green" : "gray"}>
            {selectedIds.size}/5 selected
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Participant list */}
        {loading ? (
          <div className="text-sm text-gray-400 animate-pulse py-4 text-center">
            Loading participants...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">
            {search.trim()
              ? "No participants match your search."
              : "No unassigned participants available."}
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-gray-200 p-1">
            {filtered.map((p) => {
              const isSelected = selectedIds.has(p.id);
              const group = groupMap.get(p.id) ?? [p.id];
              const hasGroup = group.length > 1;

              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 border border-emerald-300"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleParticipant(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 block truncate">
                      {p.full_name}
                    </span>
                    <span className="text-xs text-gray-500 block truncate">
                      {p.email}
                    </span>
                  </div>
                  {hasGroup && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-blue-600">
                      <Link2 className="h-3 w-3" />
                      {group.length}
                    </span>
                  )}
                  <Badge color="gray">{p.primary_role}</Badge>
                </label>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="animate-pulse">Creating...</span>
            ) : (
              `Create Team (${selectedIds.size})`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TeamCard } from "./TeamCard";
import { Sparkles, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { SerializedMatchOutput } from "@/lib/matching/types";

interface PoolStats {
  total: number;
  solos: number;
  groups: { size: number; count: number }[];
  divisibleBy5: boolean;
  remainder: number;
}

interface MatchingPreviewProps {
  adminToken: string;
  onConfirmed?: () => void;
}

export function MatchingPreview({ adminToken, onConfirmed }: MatchingPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [matchResult, setMatchResult] = useState<SerializedMatchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runMatching = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMatchResult(null);

    try {
      const res = await fetch("/api/matching/preview", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to run matching");
      }

      const data = await res.json();
      setPoolStats(data.poolStats);
      setMatchResult(data.matchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const confirmTeams = useCallback(async () => {
    if (!matchResult) return;

    setConfirming(true);
    setError(null);

    try {
      const matches = matchResult.teams.map((team) => ({
        team_id: team.id,
        participant_ids: team.members.map((m) => m.participantId),
      }));

      const res = await fetch("/api/matching/confirm", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matches }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to confirm teams");
      }

      onConfirmed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setConfirming(false);
    }
  }, [matchResult, adminToken, onConfirmed]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Team Matching
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Run the algorithm to form balanced teams from unmatched participants
            </p>
          </div>
          {!matchResult && (
            <Button onClick={runMatching} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Matching
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pool stats (pre-match info) */}
        {poolStats && !matchResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {poolStats.total}
                </div>
                <div className="text-xs text-gray-500">Total in Pool</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {poolStats.solos}
                </div>
                <div className="text-xs text-gray-500">Solos</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {poolStats.groups.reduce((s, g) => s + g.count, 0)}
                </div>
                <div className="text-xs text-gray-500">Groups</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Badge color={poolStats.divisibleBy5 ? "green" : "red"}>
                    {poolStats.divisibleBy5 ? "YES" : "NO"}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Divisible by 5
                  {!poolStats.divisibleBy5 && (
                    <span className="text-red-500">
                      {" "}({poolStats.remainder} extra)
                    </span>
                  )}
                </div>
              </div>
            </div>
            {poolStats.groups.length > 0 && (
              <div className="text-xs text-gray-500">
                Group breakdown:{" "}
                {poolStats.groups
                  .map((g) => `${g.count} group${g.count !== 1 ? "s" : ""} of ${g.size}`)
                  .join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Match results */}
        {matchResult && (
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {matchResult.teams.length}
                </div>
                <div className="text-xs text-gray-500">Teams Formed</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {matchResult.averageScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Avg Score</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {matchResult.highestScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Best Score</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {matchResult.lowestScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Lowest Score</div>
              </div>
            </div>

            {matchResult.unmatched.length > 0 && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {matchResult.unmatched.length} participant
                {matchResult.unmatched.length !== 1 ? "s" : ""} could not be
                placed on a team.
              </div>
            )}

            {/* Team cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {matchResult.teams.map((team, i) => (
                <TeamCard key={team.id} team={team} index={i} />
              ))}
            </div>

            {/* Confirm button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setMatchResult(null);
                  setPoolStats(null);
                }}
              >
                Discard & Re-run
              </Button>
              <Button onClick={confirmTeams} disabled={confirming}>
                {confirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Lock Teams
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Empty state before running */}
        {!poolStats && !matchResult && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">
            Click &quot;Run Matching&quot; to preview algorithmically formed teams.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

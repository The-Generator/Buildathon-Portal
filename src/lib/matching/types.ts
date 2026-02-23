export interface TeamProfile {
  roleDistribution: Map<string, number>;
  skillCoverage: Set<string>;
  experienceLevels: string[];
  schools: Set<string>;
}

export interface MatchInput {
  participantId: string;
  fullName: string;
  primaryRole: string;
  specificSkills: string[];
  experienceLevel: string;
  school: string;
  aiTools: string[];
  registrationGroupId: string | null;
  groupSize: number; // 1 for solo
}

export interface DraftTeam {
  id: string;
  members: MatchInput[];
  score: number;
  groupIds: Set<string>; // registration groups on this team
}

export interface MatchOutput {
  teams: DraftTeam[];
  unmatched: MatchInput[];
  averageScore: number;
  lowestScore: number;
  highestScore: number;
}

/**
 * Serializable versions of types for JSON transport (Sets/Maps -> arrays).
 */
export interface SerializedDraftTeam {
  id: string;
  members: MatchInput[];
  score: number;
  groupIds: string[];
}

export interface SerializedMatchOutput {
  teams: SerializedDraftTeam[];
  unmatched: MatchInput[];
  averageScore: number;
  lowestScore: number;
  highestScore: number;
}

export function serializeMatchOutput(output: MatchOutput): SerializedMatchOutput {
  return {
    teams: output.teams.map((t) => ({
      id: t.id,
      members: t.members,
      score: t.score,
      groupIds: Array.from(t.groupIds),
    })),
    unmatched: output.unmatched,
    averageScore: output.averageScore,
    lowestScore: output.lowestScore,
    highestScore: output.highestScore,
  };
}

export function deserializeMatchOutput(data: SerializedMatchOutput): MatchOutput {
  return {
    teams: data.teams.map((t) => ({
      id: t.id,
      members: t.members,
      score: t.score,
      groupIds: new Set(t.groupIds),
    })),
    unmatched: data.unmatched,
    averageScore: data.averageScore,
    lowestScore: data.lowestScore,
    highestScore: data.highestScore,
  };
}

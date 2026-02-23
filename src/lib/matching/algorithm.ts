import { calculateTeamScore } from "./scoring";
import type { MatchInput, DraftTeam, MatchOutput } from "./types";

const TEAM_SIZE = 5;
const MAX_SWAP_ITERATIONS = 1000;

/**
 * Deterministic ID generator based on index.
 */
function makeTeamId(index: number): string {
  return `draft-team-${String(index).padStart(3, "0")}`;
}

/**
 * Create a DraftTeam from a list of members.
 */
function buildDraftTeam(id: string, members: MatchInput[]): DraftTeam {
  const groupIds = new Set<string>();
  for (const m of members) {
    if (m.registrationGroupId) {
      groupIds.add(m.registrationGroupId);
    }
  }
  return {
    id,
    members,
    score: calculateTeamScore(members),
    groupIds,
  };
}

/**
 * Group participants by their registrationGroupId.
 * Solos (groupId === null) get groupSize 1 and each is independent.
 */
function partitionByGroup(inputs: MatchInput[]): {
  groups: Map<string, MatchInput[]>;
  solos: MatchInput[];
} {
  const groups = new Map<string, MatchInput[]>();
  const solos: MatchInput[] = [];

  for (const input of inputs) {
    if (input.registrationGroupId && input.groupSize > 1) {
      const existing = groups.get(input.registrationGroupId) ?? [];
      existing.push(input);
      groups.set(input.registrationGroupId, existing);
    } else {
      solos.push(input);
    }
  }

  return { groups, solos };
}

/**
 * Sort solos deterministically by participantId for reproducibility.
 */
function sortSolos(solos: MatchInput[]): MatchInput[] {
  return [...solos].sort((a, b) => a.participantId.localeCompare(b.participantId));
}

/**
 * From a list of candidates, find the best N to combine with a given base group
 * to form a team of TEAM_SIZE. Returns the indices of the chosen candidates.
 *
 * Uses greedy selection: pick one at a time that maximizes score.
 */
function findBestCandidates(
  base: MatchInput[],
  candidates: MatchInput[],
  needed: number
): number[] {
  if (candidates.length <= needed) {
    return candidates.map((_, i) => i);
  }

  const chosen: number[] = [];
  const used = new Set<number>();
  const current = [...base];

  for (let pick = 0; pick < needed; pick++) {
    let bestIdx = -1;
    let bestScore = -1;

    for (let i = 0; i < candidates.length; i++) {
      if (used.has(i)) continue;

      current.push(candidates[i]);
      const score = calculateTeamScore(current);
      current.pop();

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      chosen.push(bestIdx);
      used.add(bestIdx);
      current.push(candidates[bestIdx]);
    }
  }

  return chosen;
}

/**
 * Remove elements at given indices from an array (returns new array).
 */
function removeAtIndices<T>(arr: T[], indices: number[]): T[] {
  const indexSet = new Set(indices);
  return arr.filter((_, i) => !indexSet.has(i));
}

/**
 * Phase 1: Greedy construction of teams.
 */
function greedyConstruction(inputs: MatchInput[]): {
  teams: DraftTeam[];
  remaining: MatchInput[];
} {
  const { groups, solos: rawSolos } = partitionByGroup(inputs);
  let solos = sortSolos(rawSolos);
  const teams: DraftTeam[] = [];
  let teamIndex = 0;

  // Sort groups by size DESC for determinism
  const groupEntries = [...groups.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  // Categorize groups by size
  const groupsOf4: MatchInput[][] = [];
  const groupsOf3: MatchInput[][] = [];
  const groupsOf2: MatchInput[][] = [];
  const fullGroups: MatchInput[][] = []; // groups of 5

  for (const [, members] of groupEntries) {
    if (members.length >= TEAM_SIZE) {
      fullGroups.push(members.slice(0, TEAM_SIZE));
      // If group > 5, overflow into solos (shouldn't happen by constraint)
      if (members.length > TEAM_SIZE) {
        solos.push(...members.slice(TEAM_SIZE));
      }
    } else if (members.length === 4) {
      groupsOf4.push(members);
    } else if (members.length === 3) {
      groupsOf3.push(members);
    } else if (members.length === 2) {
      groupsOf2.push(members);
    } else if (members.length === 1) {
      // Solo in a group of 1 -- treat as solo
      solos.push(...members);
    }
  }

  // Re-sort solos after potential additions
  solos = sortSolos(solos);

  // Sort each group bucket so groups with membersRequested > 0 come first
  // (they explicitly asked for more members and should get priority picking solos)
  const prioritizeRequesting = (a: MatchInput[], b: MatchInput[]) => {
    const aReq = Math.max(...a.map((m) => m.membersRequested));
    const bReq = Math.max(...b.map((m) => m.membersRequested));
    return bReq - aReq;
  };
  groupsOf4.sort(prioritizeRequesting);
  groupsOf3.sort(prioritizeRequesting);
  groupsOf2.sort(prioritizeRequesting);

  // Full groups become teams directly
  for (const members of fullGroups) {
    teams.push(buildDraftTeam(makeTeamId(teamIndex++), members));
  }

  // Groups of 4: find 1 best solo to add
  for (const group of groupsOf4) {
    if (solos.length >= 1) {
      const bestIndices = findBestCandidates(group, solos, 1);
      const chosen = bestIndices.map((i) => solos[i]);
      solos = removeAtIndices(solos, bestIndices);
      teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...group, ...chosen]));
    } else {
      // No solos available - form incomplete team
      teams.push(buildDraftTeam(makeTeamId(teamIndex++), group));
    }
  }

  // Groups of 3: try to find a duo first, then fall back to 2 solos
  for (const group of groupsOf3) {
    const needed = TEAM_SIZE - group.length; // 2

    // Try pairing with a group of 2
    let paired = false;
    if (groupsOf2.length > 0) {
      let bestDuoIdx = -1;
      let bestDuoScore = -1;

      for (let i = 0; i < groupsOf2.length; i++) {
        const combined = [...group, ...groupsOf2[i]];
        const score = calculateTeamScore(combined);
        if (score > bestDuoScore) {
          bestDuoScore = score;
          bestDuoIdx = i;
        }
      }

      if (bestDuoIdx >= 0) {
        // Check if 2 solos would be better
        let bestSoloScore = -1;
        if (solos.length >= 2) {
          const soloIndices = findBestCandidates(group, solos, needed);
          if (soloIndices.length === needed) {
            const soloCombined = [...group, ...soloIndices.map((i) => solos[i])];
            bestSoloScore = calculateTeamScore(soloCombined);
          }
        }

        if (bestDuoScore >= bestSoloScore) {
          const duo = groupsOf2.splice(bestDuoIdx, 1)[0];
          teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...group, ...duo]));
          paired = true;
        }
      }
    }

    if (!paired) {
      // Fall back to solos
      if (solos.length >= needed) {
        const bestIndices = findBestCandidates(group, solos, needed);
        const chosen = bestIndices.map((i) => solos[i]);
        solos = removeAtIndices(solos, bestIndices);
        teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...group, ...chosen]));
      } else {
        // Take whatever solos are available
        const available = Math.min(solos.length, needed);
        const bestIndices = findBestCandidates(group, solos, available);
        const chosen = bestIndices.map((i) => solos[i]);
        solos = removeAtIndices(solos, bestIndices);
        teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...group, ...chosen]));
      }
    }
  }

  // Groups of 2: try to find a trio (another group of 3), or duo+solo, or 3 solos
  for (const group of groupsOf2) {
    const needed = TEAM_SIZE - group.length; // 3

    // Just use best 3 solos (groups of 3 and other duos have been consumed above)
    if (solos.length >= needed) {
      const bestIndices = findBestCandidates(group, solos, needed);
      const chosen = bestIndices.map((i) => solos[i]);
      solos = removeAtIndices(solos, bestIndices);
      teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...group, ...chosen]));
    } else {
      const available = Math.min(solos.length, needed);
      const bestIndices = findBestCandidates(group, solos, available);
      const chosen = bestIndices.map((i) => solos[i]);
      solos = removeAtIndices(solos, bestIndices);
      teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...group, ...chosen]));
    }
  }

  // Remaining solos: group into teams of 5
  while (solos.length >= TEAM_SIZE) {
    // Take the first solo as seed, greedily find best 4 from rest
    const seed = solos[0];
    const rest = solos.slice(1);
    const bestIndices = findBestCandidates([seed], rest, TEAM_SIZE - 1);
    const chosen = bestIndices.map((i) => rest[i]);
    const team = [seed, ...chosen];

    // Remove used solos
    const usedIds = new Set(team.map((m) => m.participantId));
    solos = solos.filter((s) => !usedIds.has(s.participantId));

    teams.push(buildDraftTeam(makeTeamId(teamIndex++), team));
  }

  // Any remaining solos (< 5) form a partial team
  if (solos.length > 0) {
    teams.push(buildDraftTeam(makeTeamId(teamIndex++), [...solos]));
    solos = [];
  }

  return { teams, remaining: solos };
}

/**
 * Check if a member is a solo (not part of a registration group) and thus swappable.
 */
function isSoloMember(member: MatchInput): boolean {
  return member.registrationGroupId === null || member.groupSize <= 1;
}

/**
 * Phase 2: Swap optimization.
 * Find the worst team, try swapping its solo members with solos from other teams.
 */
function swapOptimization(teams: DraftTeam[]): DraftTeam[] {
  if (teams.length < 2) return teams;

  let improved = true;
  let iterations = 0;

  while (improved && iterations < MAX_SWAP_ITERATIONS) {
    improved = false;
    iterations++;

    // Find the team with the lowest score
    let worstIdx = 0;
    let worstScore = teams[0].score;
    for (let i = 1; i < teams.length; i++) {
      if (teams[i].score < worstScore) {
        worstScore = teams[i].score;
        worstIdx = i;
      }
    }

    const worstTeam = teams[worstIdx];

    // Try swapping each solo member on the worst team with solos on other teams
    for (let mi = 0; mi < worstTeam.members.length; mi++) {
      if (!isSoloMember(worstTeam.members[mi])) continue;

      let bestSwap: {
        otherTeamIdx: number;
        otherMemberIdx: number;
        combinedImprovement: number;
      } | null = null;

      for (let ti = 0; ti < teams.length; ti++) {
        if (ti === worstIdx) continue;

        for (let oi = 0; oi < teams[ti].members.length; oi++) {
          if (!isSoloMember(teams[ti].members[oi])) continue;

          // Simulate swap
          const newWorstMembers = [...worstTeam.members];
          const newOtherMembers = [...teams[ti].members];

          const temp = newWorstMembers[mi];
          newWorstMembers[mi] = newOtherMembers[oi];
          newOtherMembers[oi] = temp;

          const newWorstScore = calculateTeamScore(newWorstMembers);
          const newOtherScore = calculateTeamScore(newOtherMembers);

          const oldCombined = worstTeam.score + teams[ti].score;
          const newCombined = newWorstScore + newOtherScore;
          const improvement = newCombined - oldCombined;

          // Only accept if total improves and worst team improves
          if (improvement > 0.01 && newWorstScore > worstTeam.score) {
            if (!bestSwap || improvement > bestSwap.combinedImprovement) {
              bestSwap = {
                otherTeamIdx: ti,
                otherMemberIdx: oi,
                combinedImprovement: improvement,
              };
            }
          }
        }
      }

      if (bestSwap) {
        // Execute the best swap found
        const { otherTeamIdx, otherMemberIdx } = bestSwap;

        const temp = worstTeam.members[mi];
        worstTeam.members[mi] = teams[otherTeamIdx].members[otherMemberIdx];
        teams[otherTeamIdx].members[otherMemberIdx] = temp;

        // Recalculate scores
        worstTeam.score = calculateTeamScore(worstTeam.members);
        teams[otherTeamIdx].score = calculateTeamScore(teams[otherTeamIdx].members);

        // Recalculate groupIds
        worstTeam.groupIds = new Set(
          worstTeam.members
            .filter((m) => m.registrationGroupId)
            .map((m) => m.registrationGroupId!)
        );
        teams[otherTeamIdx].groupIds = new Set(
          teams[otherTeamIdx].members
            .filter((m) => m.registrationGroupId)
            .map((m) => m.registrationGroupId!)
        );

        improved = true;
        break; // Restart from finding worst team
      }
    }
  }

  return teams;
}

/**
 * Compute statistics for the match output.
 */
function computeStats(teams: DraftTeam[]): {
  averageScore: number;
  lowestScore: number;
  highestScore: number;
} {
  if (teams.length === 0) {
    return { averageScore: 0, lowestScore: 0, highestScore: 0 };
  }

  const scores = teams.map((t) => t.score);
  const sum = scores.reduce((a, b) => a + b, 0);

  return {
    averageScore: Math.round((sum / scores.length) * 100) / 100,
    lowestScore: Math.min(...scores),
    highestScore: Math.max(...scores),
  };
}

/**
 * Main matching algorithm entry point.
 * Deterministic given the same inputs (sorted by participantId).
 */
export function runMatching(inputs: MatchInput[]): MatchOutput {
  if (inputs.length === 0) {
    return {
      teams: [],
      unmatched: [],
      averageScore: 0,
      lowestScore: 0,
      highestScore: 0,
    };
  }

  // Sort inputs deterministically
  const sorted = [...inputs].sort((a, b) =>
    a.participantId.localeCompare(b.participantId)
  );

  // Phase 1: Greedy construction
  const { teams } = greedyConstruction(sorted);

  // Phase 2: Swap optimization
  const optimized = swapOptimization(teams);

  // Separate complete teams from incomplete (unmatched remainders)
  const completeTeams: DraftTeam[] = [];
  const unmatched: MatchInput[] = [];

  for (const team of optimized) {
    if (team.members.length === TEAM_SIZE) {
      completeTeams.push(team);
    } else if (team.members.length > 0) {
      // Incomplete team -- still include it as a team but flag it
      completeTeams.push(team);
    }
  }

  const stats = computeStats(completeTeams);

  return {
    teams: completeTeams,
    unmatched,
    ...stats,
  };
}

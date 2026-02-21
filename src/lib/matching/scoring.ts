import { SPECIFIC_SKILLS, EXPERIENCE_LEVELS } from "@/lib/constants";
import type { MatchInput } from "./types";

const WEIGHT_ROLE_DIVERSITY = 0.4;
const WEIGHT_SKILL_COVERAGE = 0.35;
const WEIGHT_EXPERIENCE_BALANCE = 0.15;
const WEIGHT_SCHOOL_MIX = 0.1;

/**
 * Role diversity score (0-1).
 * Count unique primary roles / 5 (ideal team size). 5 unique roles = full score.
 */
function roleDiversityScore(members: MatchInput[]): number {
  const uniqueRoles = new Set(members.map((m) => m.primaryRole));
  return Math.min(uniqueRoles.size / 5, 1.0);
}

/**
 * Skill coverage score (0-1).
 * Count unique skills across all members / total possible skills.
 */
function skillCoverageScore(members: MatchInput[]): number {
  const uniqueSkills = new Set(members.flatMap((m) => m.specificSkills));
  return Math.min(uniqueSkills.size / SPECIFIC_SKILLS.length, 1.0);
}

/**
 * Experience balance score (0-1).
 * Best = mix of levels. Penalize all-same (especially all beginner or all advanced).
 * Score based on how many distinct levels are present and the distribution entropy.
 */
function experienceBalanceScore(members: MatchInput[]): number {
  if (members.length === 0) return 0;

  const levelCounts = new Map<string, number>();
  for (const m of members) {
    levelCounts.set(m.experienceLevel, (levelCounts.get(m.experienceLevel) ?? 0) + 1);
  }

  const uniqueLevels = levelCounts.size;
  const totalLevels = EXPERIENCE_LEVELS.length; // 3

  // Base score from diversity scaled to total available levels
  const diversityBase = Math.min(uniqueLevels / totalLevels + 0.1, 1.0);

  // Entropy bonus: more even distribution = higher score
  const n = members.length;
  let entropy = 0;
  for (const count of levelCounts.values()) {
    const p = count / n;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  const maxEntropy = Math.log2(Math.min(n, totalLevels));
  const entropyNormalized = maxEntropy > 0 ? entropy / maxEntropy : 0;

  // Combine: 60% diversity base, 40% entropy
  return diversityBase * 0.6 + entropyNormalized * 0.4;
}

/**
 * School mix score (0-1).
 * Count unique schools / min(team_size, 4). More schools = higher score.
 */
function schoolMixScore(members: MatchInput[]): number {
  if (members.length === 0) return 0;
  const uniqueSchools = new Set(members.map((m) => m.school));
  const denominator = Math.min(members.length, 4);
  return Math.min(uniqueSchools.size / denominator, 1.0);
}

/**
 * Calculate a team score from 0 to 100 based on weighted combination of:
 * - Role diversity (40%)
 * - Skill coverage (35%)
 * - Experience balance (15%)
 * - School mix (10%)
 */
export function calculateTeamScore(members: MatchInput[]): number {
  if (members.length === 0) return 0;

  const role = roleDiversityScore(members);
  const skill = skillCoverageScore(members);
  const experience = experienceBalanceScore(members);
  const school = schoolMixScore(members);

  const weighted =
    role * WEIGHT_ROLE_DIVERSITY +
    skill * WEIGHT_SKILL_COVERAGE +
    experience * WEIGHT_EXPERIENCE_BALANCE +
    school * WEIGHT_SCHOOL_MIX;

  return Math.round(weighted * 100 * 100) / 100; // 2 decimal places
}

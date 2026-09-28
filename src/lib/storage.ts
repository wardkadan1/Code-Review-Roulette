import {
  type Assignment,
  type Round,
  validateDerangement,
  validateTeam,
} from "./assignment";
export const STORAGE_KEY = "code-review-roulette:v1";
function pair(value: unknown): value is Assignment {
  return (
    !!value &&
    typeof value === "object" &&
    "owner" in value &&
    typeof value.owner === "string" &&
    "reviewer" in value &&
    typeof value.reviewer === "string"
  );
}
export function parseRound(raw: string | null): Round | null {
  try {
    if (!raw) return null;
    const r = JSON.parse(raw);
    if (
      !r ||
      !Array.isArray(r.team) ||
      !r.team.every((n: unknown) => typeof n === "string" && n === n.trim()) ||
      validateTeam(r.team)
    )
      return null;
    if (
      !Array.isArray(r.plan) ||
      !r.plan.every(pair) ||
      !validateDerangement(r.team, r.plan)
    )
      return null;
    if (
      !Array.isArray(r.completed) ||
      r.completed.length > 5 ||
      !r.completed.every(
        (p: unknown, i: number) =>
          pair(p) &&
          p.owner === r.plan[i].owner &&
          p.reviewer === r.plan[i].reviewer,
      )
    )
      return null;
    if (r.status === "complete")
      return r.completed.length === 5 && r.selectedOwner === null ? r : null;
    if (r.completed.length === 5) return null;
    if (r.status === "owner" && r.selectedOwner === null) return r;
    if (
      r.status === "reviewer" &&
      r.selectedOwner === r.plan[r.completed.length].owner
    )
      return r;
    return null;
  } catch {
    return null;
  }
}

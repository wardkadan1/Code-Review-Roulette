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
      r.completed.length > r.team.length ||
      !r.completed.every(
        (p: unknown, i: number) =>
          pair(p) &&
          p.owner === r.plan[i].owner &&
          p.reviewer === r.plan[i].reviewer,
      )
    )
      return null;
    const done = r.completed.length === r.team.length;
    if (r.phase === undefined) {
      // Accept existing manual rounds, restarting only the unfinished reveal.
      if (!["owner", "reviewer", "complete"].includes(r.status)) return null;
      if (
        r.status === "complete"
          ? !done || r.selectedOwner !== null
          : done ||
            (r.status === "owner"
              ? r.selectedOwner !== null
              : r.selectedOwner !== r.plan[r.completed.length].owner)
      )
        return null;
    } else {
      if (
        ![
          "idle",
          "owner-spinning",
          "owner-selected",
          "reviewer-spinning",
          "reviewer-selected",
          "between-assignments",
          "complete",
        ].includes(r.phase)
      )
        return null;
      if (r.phase === "complete" && !done) return null;
      if (done && !["complete", "reviewer-selected"].includes(r.phase))
        return null;
      if (
        ["reviewer-selected", "between-assignments"].includes(r.phase) &&
        !r.completed.length
      )
        return null;
    }
    return {
      team: r.team,
      plan: r.plan,
      completed: r.completed,
      phase: done ? "complete" : "idle",
    };
  } catch {
    return null;
  }
}

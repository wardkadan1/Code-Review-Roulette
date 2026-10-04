export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 20;
export const DEFAULT_PARTICIPANTS = 5;
export type Assignment = { owner: string; reviewer: string };
export type RoundPhase =
  | "idle"
  | "owner-spinning"
  | "owner-selected"
  | "reviewer-spinning"
  | "reviewer-selected"
  | "between-assignments"
  | "complete";
export type Round = {
  team: string[];
  plan: Assignment[];
  completed: Assignment[];
  phase: RoundPhase;
};
export const PHASE_DELAY: Record<Exclude<RoundPhase, "complete">, number> = {
  idle: 800,
  "owner-spinning": 2700,
  "owner-selected": 800,
  "reviewer-spinning": 2700,
  "reviewer-selected": 1200,
  "between-assignments": 750,
};
export function validateTeam(names: string[]): string | null {
  if (names.length < MIN_PARTICIPANTS || names.length > MAX_PARTICIPANTS)
    return `Choose ${MIN_PARTICIPANTS}–${MAX_PARTICIPANTS} participants.`;
  if (names.some((n) => !n.trim()))
    return `Enter all ${names.length} names to start your round.`;
  if (new Set(names.map((n) => n.trim().toLowerCase())).size !== names.length)
    return "Each team member must have a unique name.";
  return null;
}
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function validateDerangement(
  team: string[],
  pairs: Assignment[],
): boolean {
  return (
    !validateTeam(team) &&
    pairs.length === team.length &&
    new Set(pairs.map((p) => p.owner)).size === team.length &&
    new Set(pairs.map((p) => p.reviewer)).size === team.length &&
    pairs.every(
      (p) =>
        team.includes(p.owner) &&
        team.includes(p.reviewer) &&
        p.owner !== p.reviewer,
    )
  );
}
export function generateDerangement(
  team: string[],
  previous?: Assignment[],
): Assignment[] {
  if (validateTeam(team)) throw new Error(validateTeam(team)!);
  const toPairs = (reviewers: string[]) =>
    team.map((owner, i) => ({ owner, reviewer: reviewers[i] }));
  const fresh = (pairs: Assignment[]) =>
    !previous ||
    pairs.some(
      (p) => previous.find((q) => q.owner === p.owner)?.reviewer !== p.reviewer,
    );
  // Rejection sampling is inexpensive (~e attempts) regardless of team size.
  for (let attempt = 0; attempt < 128; attempt++) {
    const pairs = toPairs(shuffle(team));
    if (validateDerangement(team, pairs) && fresh(pairs)) return shuffle(pairs);
  }
  // Bounded fallback also handles a degenerate random source without hanging.
  for (let offset = 1; offset < team.length; offset++) {
    const pairs = toPairs(team.map((_, i) => team[(i + offset) % team.length]));
    if (fresh(pairs)) return shuffle(pairs);
  }
  throw new Error("Could not create a fresh round.");
}
export function generateRound(names: string[], previous?: Assignment[]): Round {
  const team = names.map((n) => n.trim());
  return {
    team,
    plan: generateDerangement(team, previous),
    completed: [],
    phase: "idle",
  };
}
export function advanceRound(round: Round): Round {
  const phases: Partial<Record<RoundPhase, RoundPhase>> = {
    idle: "owner-spinning",
    "owner-spinning": "owner-selected",
    "owner-selected": "reviewer-spinning",
    "reviewer-selected":
      round.completed.length === round.team.length
        ? "complete"
        : "between-assignments",
    "between-assignments": "owner-spinning",
  };
  if (round.phase === "complete") return round;
  if (round.phase === "reviewer-spinning")
    return {
      ...round,
      completed: [...round.completed, round.plan[round.completed.length]],
      phase: "reviewer-selected",
    };
  return { ...round, phase: phases[round.phase]! };
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => Array.from(n)[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export function landingRotation(index: number, count: number) {
  return 1800 + ((360 - ((index + 0.5) * 360) / count) % 360);
}

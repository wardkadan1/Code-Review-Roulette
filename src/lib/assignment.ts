export type Assignment = { owner: string; reviewer: string };
export type Round = {
  team: string[];
  plan: Assignment[];
  completed: Assignment[];
  selectedOwner: string | null;
  status: "owner" | "reviewer" | "complete";
};
export function validateTeam(names: string[]): string | null {
  if (names.length !== 5 || names.some((n) => !n.trim()))
    return "Enter all 5 names to start your round.";
  if (new Set(names.map((n) => n.trim().toLocaleLowerCase())).size !== 5)
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
    pairs.length === 5 &&
    new Set(pairs.map((p) => p.owner)).size === 5 &&
    new Set(pairs.map((p) => p.reviewer)).size === 5 &&
    pairs.every(
      (p) =>
        team.includes(p.owner) &&
        team.includes(p.reviewer) &&
        p.owner !== p.reviewer,
    )
  );
}
// Enumerating 44 valid permutations is bounded and avoids a retry loop.
export function generateDerangement(
  team: string[],
  previous?: Assignment[],
): Assignment[] {
  if (validateTeam(team)) throw new Error(validateTeam(team)!);
  const options: string[][] = [];
  function visit(prefix: string[], remaining: string[]) {
    if (!remaining.length) {
      options.push(prefix);
      return;
    }
    for (const name of remaining)
      if (name !== team[prefix.length])
        visit(
          [...prefix, name],
          remaining.filter((n) => n !== name),
        );
  }
  visit([], team);
  const fresh = options.filter(
    (order) =>
      !previous ||
      order.some(
        (n, i) => previous.find((p) => p.owner === team[i])?.reviewer !== n,
      ),
  );
  const selected = fresh[Math.floor(Math.random() * fresh.length)];
  return shuffle(team.map((owner, i) => ({ owner, reviewer: selected[i] })));
}
export function generateRound(names: string[], previous?: Assignment[]): Round {
  const team = names.map((n) => n.trim());
  return {
    team,
    plan: generateDerangement(team, previous),
    completed: [],
    selectedOwner: null,
    status: "owner",
  };
}
export function selectOwner(round: Round): Round {
  if (round.status !== "owner") throw new Error("Choose a reviewer first.");
  return {
    ...round,
    selectedOwner: round.plan[round.completed.length].owner,
    status: "reviewer",
  };
}
export function selectReviewer(round: Round): Round {
  if (round.status !== "reviewer") throw new Error("Choose an owner first.");
  const completed = [...round.completed, round.plan[round.completed.length]];
  return {
    ...round,
    completed,
    selectedOwner: null,
    status: completed.length === 5 ? "complete" : "owner",
  };
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

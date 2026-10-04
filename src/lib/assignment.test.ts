import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateRound,
  advanceRound,
  validateTeam,
  validateDerangement,
  MAX_PARTICIPANTS,
  landingRotation,
} from "./assignment";
import { parseRound } from "./storage";
const teamOf = (n: number) =>
  Array.from({ length: n }, (_, i) => `Person ${i + 1}`);
test("10,000 automatic rounds across 3, 4, 5, 10 and 20 participants", () => {
  for (let i = 0; i < 10000; i++) {
    const team = teamOf([3, 4, 5, 10, 20][i % 5]);
    let r = generateRound(team);
    assert.ok(validateDerangement(team, r.plan));
    assert.deepEqual(r.plan.map((p) => p.owner).sort(), [...team].sort());
    assert.deepEqual(r.plan.map((p) => p.reviewer).sort(), [...team].sort());
    let steps = 0;
    while (r.phase !== "complete") {
      const before = r;
      r = advanceRound(r);
      assert.equal(
        r.completed.length - before.completed.length,
        before.phase === "reviewer-spinning" ? 1 : 0,
      );
      assert.ok(++steps < team.length * 7);
    }
    assert.equal(r.completed.length, team.length);
    assert.equal(advanceRound(r), r);
  }
});
test("rejects too small, too large, blank and duplicate teams", () => {
  for (const team of [
    teamOf(2),
    teamOf(MAX_PARTICIPANTS + 1),
    ["a", "A", "c"],
    ["a", " ", "c"],
  ]) {
    assert.ok(validateTeam(team));
    assert.throws(() => generateRound(team));
  }
});
test("replay creates a fresh valid mapping and clears progress for each size", () => {
  for (const size of [3, 4, 5, 10, 20]) {
    const old = generateRound(teamOf(size));
    for (let i = 0; i < 100; i++) {
      const fresh = generateRound(old.team, old.plan);
      assert.ok(validateDerangement(fresh.team, fresh.plan));
      assert.ok(
        fresh.plan.some(
          (p) =>
            old.plan.find((q) => q.owner === p.owner)?.reviewer !== p.reviewer,
        ),
      );
      assert.deepEqual(fresh.completed, []);
      assert.equal(fresh.phase, "idle");
    }
  }
});
test("safe refresh in every phase retains completed prefix without duplicates", () => {
  for (const size of [3, 5, 10, 20]) {
    let r = generateRound(teamOf(size));
    while (true) {
      const restored = parseRound(JSON.stringify(r))!;
      assert.ok(restored);
      assert.deepEqual(restored.plan, r.plan);
      assert.deepEqual(restored.completed, r.completed);
      assert.equal(
        restored.phase,
        r.completed.length === size ? "complete" : "idle",
      );
      let resumed = restored;
      while (resumed.phase !== "complete") resumed = advanceRound(resumed);
      assert.equal(new Set(resumed.completed.map((p) => p.owner)).size, size);
      if (r.phase === "complete") break;
      r = advanceRound(r);
    }
  }
});
test("malformed and inconsistent saved states are rejected", () => {
  const r = generateRound(teamOf(5));
  for (const bad of [
    null,
    "{",
    "null",
    "{}",
    JSON.stringify({ ...r, phase: "unknown" }),
    JSON.stringify({ ...r, phase: "complete" }),
    JSON.stringify({ ...r, phase: "reviewer-selected" }),
    JSON.stringify({ ...r, completed: [r.plan[1]] }),
    JSON.stringify({
      ...r,
      plan: r.plan.map((p) => ({ ...p, reviewer: p.owner })),
    }),
  ])
    assert.equal(parseRound(bad), null);
});
test("legacy manual round migration preserves results and restarts current reveal", () => {
  const r = generateRound(teamOf(5));
  const { phase, ...legacy } = r;
  void phase;
  const saved = {
    ...legacy,
    completed: [r.plan[0]],
    status: "reviewer",
    selectedOwner: r.plan[1].owner,
  };
  assert.deepEqual(parseRound(JSON.stringify(saved)), {
    ...r,
    completed: [r.plan[0]],
    phase: "idle",
  });
});
test("every possible wheel landing points to its selected segment", () => {
  for (let n = 1; n <= MAX_PARTICIPANTS; n++)
    for (let i = 0; i < n; i++) {
      const angle = (((i + 0.5) * 360) / n + landingRotation(i, n)) % 360;
      assert.ok(Math.min(Math.abs(angle), Math.abs(360 - angle)) < 1e-8);
    }
});

test("bounded fallback stays valid and fresh with a constant random source", () => {
  const original = Math.random;
  try {
    Math.random = () => 0.999999;
    for (const size of [3, 5, 20]) {
      const first = generateRound(teamOf(size));
      const next = generateRound(first.team, first.plan);
      assert.ok(validateDerangement(next.team, next.plan));
      assert.ok(
        next.plan.some(
          (p) =>
            first.plan.find((q) => q.owner === p.owner)?.reviewer !==
            p.reviewer,
        ),
      );
    }
  } finally {
    Math.random = original;
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateRound,
  selectOwner,
  selectReviewer,
  validateTeam,
  validateDerangement,
} from "./assignment";
import { parseRound } from "./storage";
const team = ["Ada", "Grace", "Linus", "Margaret", "Ken"];
test("10,000 rounds contain exact team, unique owners/reviewers and no self-review", () => {
  for (let i = 0; i < 10000; i++) {
    let r = generateRound(team);
    assert.equal(validateDerangement(team, r.plan), true);
    assert.deepEqual([...r.plan.map((p) => p.owner)].sort(), [...team].sort());
    assert.deepEqual(
      [...r.plan.map((p) => p.reviewer)].sort(),
      [...team].sort(),
    );
    for (let j = 0; j < 5; j++) {
      r = selectOwner(r);
      assert.notEqual(r.selectedOwner, r.plan[j].reviewer);
      r = selectReviewer(r);
    }
    assert.equal(r.status, "complete");
    assert.equal(r.completed.length, 5);
  }
});
test("rejects blank, duplicate, case-insensitive duplicate and incorrect team size", () => {
  for (const names of [
    ["a", "A", "b", "c", "d"],
    ["a", "a", "b", "c", "d"],
    ["a", " ", "b", "c", "d"],
    ["a", "b"],
  ])
    assert.throws(() => generateRound(names));
  assert.equal(validateTeam(team), null);
});
test("reset and replay clear progress and produce a different valid mapping", () => {
  const r = selectReviewer(selectOwner(generateRound(team)));
  for (let i = 0; i < 100; i++) {
    const fresh = generateRound(team, r.plan);
    assert.equal(validateDerangement(team, fresh.plan), true);
    assert.equal(fresh.completed.length, 0);
    assert.equal(fresh.selectedOwner, null);
    assert.ok(
      fresh.plan.some(
        (p) => r.plan.find((q) => q.owner === p.owner)?.reviewer !== p.reviewer,
      ),
    );
  }
});
test("rejects out-of-order transitions", () => {
  const r = generateRound(team);
  assert.throws(() => selectReviewer(r));
  assert.throws(() => selectOwner(selectOwner(r)));
});
test("restores every stable round stage", () => {
  let r = generateRound(team);
  assert.deepEqual(parseRound(JSON.stringify(r)), r);
  for (let i = 0; i < 5; i++) {
    r = selectOwner(r);
    assert.deepEqual(parseRound(JSON.stringify(r)), r);
    r = selectReviewer(r);
    assert.deepEqual(parseRound(JSON.stringify(r)), r);
  }
});
test("rejects malformed storage, inconsistent progress and invalid plans", () => {
  const r = generateRound(team);
  for (const bad of [
    null,
    "{",
    "{}",
    "null",
    JSON.stringify({ ...r, status: "spin" }),
    JSON.stringify({ ...r, selectedOwner: "Intruder" }),
    JSON.stringify({ ...r, completed: [r.plan[1]] }),
    JSON.stringify({ ...r, team: ["a"] }),
    JSON.stringify({
      ...r,
      plan: r.plan.map((p) => ({ ...p, reviewer: p.owner })),
    }),
  ])
    assert.equal(parseRound(bad), null);
});

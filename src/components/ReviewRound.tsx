"use client";
import { useEffect, useState } from "react";
import {
  type Round,
  generateRound,
  initials,
  advanceRound,
  PHASE_DELAY,
} from "@/lib/assignment";
import ReviewWheel from "./ReviewWheel";
import AssignmentList from "./AssignmentList";
import ResetDialog from "./ResetDialog";
export default function ReviewRound({
  round,
  onChange,
  onNew,
}: {
  round: Round;
  onChange: (r: Round) => void;
  onNew: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (confirm || round.phase === "complete") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay =
      reduced && round.phase.endsWith("spinning")
        ? 100
        : PHASE_DELAY[round.phase];
    const timer = window.setTimeout(() => onChange(advanceRound(round)), delay);
    return () => window.clearTimeout(timer);
  }, [round, onChange, confirm]);
  const revealing = round.phase === "reviewer-selected";
  const consumed = revealing ? round.completed.slice(0, -1) : round.completed;
  const target = round.plan[consumed.length];
  const ownerSelected = [
    "owner-selected",
    "reviewer-spinning",
    "reviewer-selected",
  ].includes(round.phase);
  const owners = round.team.filter((n) => !consumed.some((p) => p.owner === n));
  const reviewers = round.team.filter(
    (n) =>
      !(ownerSelected && n === target?.owner) &&
      !consumed.some((p) => p.reviewer === n),
  );
  const complete = round.phase === "complete";
  const ownerState = complete
    ? "complete"
    : round.phase === "owner-spinning"
      ? "spinning"
      : ownerSelected
        ? "selected"
        : "waiting";
  const reviewerState = complete
    ? "complete"
    : round.phase === "reviewer-spinning"
      ? "spinning"
      : revealing
        ? "selected"
        : "waiting";
  const last = round.completed.at(-1);
  function restart() {
    onChange(generateRound(round.team, round.plan));
    setConfirm(false);
    setRevision((r) => r + 1);
  }
  const message =
    revealing || round.phase === "between-assignments"
      ? `${last?.owner} → ${last?.reviewer}`
      : round.phase === "reviewer-spinning"
        ? `Finding reviewer for ${target.owner}…`
        : ownerSelected
          ? `${target.owner}'s code is selected`
          : round.phase === "owner-spinning"
            ? "Selecting code owner…"
            : "Your automatic draw is about to begin";
  return (
    <>
      <div className="round-toolbar">
        <div className="team-chips">
          {round.team.map((n) => (
            <span key={n}>
              <i>{initials(n)}</i>
              {n}
            </span>
          ))}
        </div>
        {!complete && (
          <button className="text-button" onClick={() => setConfirm(true)}>
            ↻ Reset Round
          </button>
        )}
      </div>
      <div className="wheels">
        <ReviewWheel
          key={`owner-${revision}-${consumed.length}`}
          names={owners}
          team={round.team}
          title="Code Owner"
          description="Whose code should be reviewed?"
          target={target?.owner}
          state={ownerState}
        />
        <ReviewWheel
          key={`reviewer-${revision}-${consumed.length}-${ownerSelected}`}
          names={reviewers}
          team={round.team}
          title="Reviewer"
          description="Who will review the selected code?"
          target={target?.reviewer}
          state={reviewerState}
        />
      </div>
      <div className="current-match" aria-live="polite">
        <span className="status-dot" />
        <div>
          <strong>{complete ? "Review Round Complete 🎉" : message}</strong>
          <p>
            {complete
              ? "Everyone has been assigned exactly one reviewer."
              : confirm
                ? "Draw paused while you decide."
                : revealing || round.phase === "between-assignments"
                  ? "Match made. The next reveal will begin automatically."
                  : ownerSelected
                    ? "Code Owner selected. A fresh perspective is on its way."
                    : "Sit back. We’ll reveal every match automatically."}
          </p>
        </div>
        {complete ? (
          <div className="actions">
            <button className="primary" onClick={restart}>
              Replay With Same Team
            </button>
            <button className="secondary" onClick={onNew}>
              Start New Round
            </button>
          </div>
        ) : (
          <span className="round-progress">
            {round.completed.length}
            <span> / {round.team.length}</span>
          </span>
        )}
      </div>
      <AssignmentList assignments={round.completed} total={round.team.length} />
      {confirm && (
        <ResetDialog onCancel={() => setConfirm(false)} onReset={restart} />
      )}
    </>
  );
}

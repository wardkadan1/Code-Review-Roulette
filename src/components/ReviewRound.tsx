"use client";
import { useState } from "react";
import {
  type Round,
  generateRound,
  initials,
  selectOwner,
  selectReviewer,
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
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [revision, setRevision] = useState(0);
  const owners = round.team.filter(
    (n) => !round.completed.some((p) => p.owner === n),
  );
  const reviewers = round.team.filter(
    (n) =>
      n !== round.selectedOwner &&
      !round.completed.some((p) => p.reviewer === n),
  );
  const target = round.plan[round.completed.length];
  const last = round.completed.at(-1);
  function restart() {
    onChange(generateRound(round.team, round.plan));
    setConfirm(false);
    setBusy(false);
    setRevision((r) => r + 1);
  }
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
        {round.status !== "complete" && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() =>
              round.completed.length ? setConfirm(true) : restart()
            }
          >
            ↻ Reset Round
          </button>
        )}
      </div>
      <div className="wheels">
        <ReviewWheel
          key={`owner-${revision}-${round.completed.length}`}
          names={owners}
          team={round.team}
          title="Code Owner"
          description="Whose code should be reviewed?"
          disabled={busy || round.status !== "owner"}
          target={target?.owner}
          selected={round.status === "reviewer"}
          onStart={() => setBusy(true)}
          onFinish={() => {
            onChange(selectOwner(round));
            setBusy(false);
          }}
        />
        <ReviewWheel
          key={`reviewer-${revision}-${round.completed.length}-${round.selectedOwner}`}
          names={reviewers}
          team={round.team}
          title="Reviewer"
          description="Who will review the selected code?"
          disabled={busy || round.status !== "reviewer"}
          target={target?.reviewer}
          onStart={() => setBusy(true)}
          onFinish={() => {
            onChange(selectReviewer(round));
            setBusy(false);
          }}
        />
      </div>
      <div className="current-match" aria-live="polite">
        <span className="status-dot" />
        <div>
          {round.status === "complete" ? (
            <>
              <strong>Review Round Complete 🎉</strong>
              <p>Everyone has been assigned exactly one reviewer.</p>
            </>
          ) : round.selectedOwner ? (
            <>
              <strong>{round.selectedOwner}&apos;s code is selected</strong>
              <p>
                {busy
                  ? "Finding their fresh perspective…"
                  : "Now choose a reviewer"}
              </p>
            </>
          ) : (
            <>
              <strong>
                {last
                  ? `${last.owner} → ${last.reviewer}`
                  : "Spin the Code Owner wheel to begin"}
              </strong>
              <p>
                {busy
                  ? "Choosing whose code is up next…"
                  : last
                    ? "Match made. Spin the Code Owner wheel for the next one."
                    : "Let a little chance bring a fresh perspective."}
              </p>
            </>
          )}
        </div>
        {round.status === "complete" ? (
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
            <span> / 5</span>
          </span>
        )}
      </div>
      <AssignmentList assignments={round.completed} />
      {confirm && (
        <ResetDialog onCancel={() => setConfirm(false)} onReset={restart} />
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import {
  validateTeam,
  MIN_PARTICIPANTS,
  MAX_PARTICIPANTS,
  DEFAULT_PARTICIPANTS,
} from "@/lib/assignment";
export default function TeamSetup({
  onStart,
}: {
  onStart: (names: string[]) => void;
}) {
  const [count, setCount] = useState(DEFAULT_PARTICIPANTS);
  const [names, setNames] = useState<string[]>(
    Array(MAX_PARTICIPANTS).fill(""),
  );
  const activeNames = names.slice(0, count);
  const error = validateTeam(activeNames);
  const duplicate =
    new Set(activeNames.map((n) => n.trim().toLowerCase()).filter(Boolean))
      .size < activeNames.filter((n) => n.trim()).length;
  return (
    <section className="setup-card card">
      <div className="section-icon">⌘</div>
      <h2>Set Up Your Review Team</h2>
      <p>Enter the {count} people participating in this review round</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!error) onStart(activeNames);
        }}
      >
        <div className="participant-control">
          <div>
            <span id="participant-label">Number of Participants</span>
            <small>
              {MIN_PARTICIPANTS}–{MAX_PARTICIPANTS} teammates
            </small>
          </div>
          <div
            className="stepper"
            role="group"
            aria-labelledby="participant-label"
          >
            <button
              type="button"
              aria-label="Decrease participants"
              disabled={count === MIN_PARTICIPANTS}
              onClick={() => setCount((c) => c - 1)}
            >
              −
            </button>
            <output aria-live="polite">{count}</output>
            <button
              type="button"
              aria-label="Increase participants"
              disabled={count === MAX_PARTICIPANTS}
              onClick={() => setCount((c) => c + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className="input-list">
          {activeNames.map((name, i) => (
            <label key={i}>
              <span className="person-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="input-content">
                <span>Person {i + 1}</span>
                <input
                  autoComplete="off"
                  maxLength={60}
                  placeholder="Enter name"
                  value={name}
                  aria-invalid={duplicate}
                  aria-describedby="team-validation"
                  onChange={(e) =>
                    setNames(
                      names.map((n, j) => (j === i ? e.target.value : n)),
                    )
                  }
                />
              </span>
            </label>
          ))}
        </div>
        <p
          id="team-validation"
          className={duplicate ? "validation error" : "validation"}
        >
          {duplicate
            ? "Each team member must have a unique name."
            : `${activeNames.filter((n) => n.trim()).length} of ${count} teammates added`}
        </p>
        <button className="primary full" disabled={!!error}>
          Start Review Round <span>↗</span>
        </button>
      </form>
      <div className="privacy-note">
        <span>◇</span> Just your team. No accounts. No data leaves this browser.
      </div>
    </section>
  );
}

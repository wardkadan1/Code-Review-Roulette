"use client";
import { useState } from "react";
import { validateTeam } from "@/lib/assignment";
export default function TeamSetup({
  onStart,
}: {
  onStart: (names: string[]) => void;
}) {
  const [names, setNames] = useState(["", "", "", "", ""]);
  const error = validateTeam(names);
  const duplicate =
    new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean)).size <
    names.filter((n) => n.trim()).length;
  return (
    <section className="setup-card card">
      <div className="section-icon">⌘</div>
      <h2>Set Up Your Review Team</h2>
      <p>Enter the 5 people participating in this review round</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!error) onStart(names);
        }}
      >
        <div className="input-list">
          {names.map((name, i) => (
            <label key={i}>
              <span className="person-number">0{i + 1}</span>
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
            : `${names.filter((n) => n.trim()).length} of 5 teammates added`}
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

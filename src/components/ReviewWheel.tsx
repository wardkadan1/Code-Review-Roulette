"use client";
import { type CSSProperties } from "react";
import { landingRotation, PHASE_DELAY } from "@/lib/assignment";
const colors = ["#9d8bcc", "#739d9c", "#c19b78", "#7d91b6", "#ad7e99"];
export default function ReviewWheel({
  names,
  team,
  title,
  description,
  target,
  state,
}: {
  names: string[];
  team: string[];
  title: string;
  description: string;
  target?: string;
  state: "waiting" | "spinning" | "selected" | "complete";
}) {
  const rotation =
    target && names.includes(target)
      ? landingRotation(names.indexOf(target), names.length)
      : 0;
  const count = names.length;
  const slices = names
    .map(
      (name, i) =>
        `${colors[team.indexOf(name) % colors.length]} ${(i * 360) / count}deg ${((i + 1) * 360) / count}deg`,
    )
    .join(",");
  return (
    <section
      className={`wheel-card card ${state === "waiting" ? "waiting" : ""}`}
    >
      <div className="wheel-heading">
        <div>
          <span className="eyebrow">
            {title === "Code Owner"
              ? "01 / SELECT THE CODE"
              : "02 / MAKE THE MATCH"}
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="pool-count">{count} left</span>
      </div>
      <div className="wheel-wrap">
        <div className="pointer" />
        <div
          className={`wheel ${state === "spinning" ? "auto-spinning" : ""} ${count > 8 ? "dense-wheel" : ""}`}
          role="img"
          aria-label={`${title} choices: ${names.join(", ") || "Round complete"}`}
          style={
            {
              background: count ? `conic-gradient(${slices})` : "#24252c",
              transform: `rotate(${state === "selected" ? rotation : 0}deg)`,
              "--landing": `${rotation}deg`,
              "--spin-duration": `${PHASE_DELAY["owner-spinning"]}ms`,
            } as CSSProperties
          }
        >
          {names.map((name, i) => (
            <div
              key={name}
              className="wheel-label"
              style={{ transform: `rotate(${((i + 0.5) * 360) / count}deg)` }}
            >
              <span
                title={name}
                style={{ fontSize: count > 12 ? 9 : count > 8 ? 10 : 12 }}
              >
                {name.length > (count > 8 ? 9 : 16)
                  ? name.slice(0, count > 8 ? 8 : 15) + "…"
                  : name}
              </span>
            </div>
          ))}
        </div>
        <div className="wheel-hub">{count ? "⌘" : "✓"}</div>
      </div>
      <div className={`wheel-state ${state}`} role="status">
        {state === "complete" ? (
          "Complete"
        ) : state === "spinning" ? (
          `Selecting ${title.toLowerCase()}…`
        ) : state === "selected" ? (
          <>
            <span>Selected</span>
            <strong>{target}</strong>
          </>
        ) : title === "Reviewer" ? (
          "Waiting for owner…"
        ) : (
          "Next reveal coming up…"
        )}
      </div>
      <p className="wheel-hint">
        {title === "Reviewer"
          ? "One teammate. One review. No self-reviews."
          : "A fresh perspective starts with a spin."}
      </p>
    </section>
  );
}

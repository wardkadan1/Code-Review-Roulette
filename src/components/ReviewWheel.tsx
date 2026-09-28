"use client";
import { useEffect, useRef, useState } from "react";
const colors = ["#9d8bcc", "#739d9c", "#c19b78", "#7d91b6", "#ad7e99"];
export function landingRotation(index: number, count: number) {
  return 1800 + ((360 - ((index + 0.5) * 360) / count) % 360);
}
export default function ReviewWheel({
  names,
  team,
  title,
  description,
  disabled,
  target,
  selected = false,
  onStart,
  onFinish,
}: {
  names: string[];
  team: string[];
  title: string;
  description: string;
  disabled: boolean;
  target?: string;
  selected?: boolean;
  onStart: () => void;
  onFinish: () => void;
}) {
  const [rotation, setRotation] = useState(() =>
    selected && target
      ? landingRotation(names.indexOf(target), names.length) % 360
      : 0,
  );
  const [spinning, setSpinning] = useState(false);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const count = names.length;
  const slices = names
    .map(
      (name, i) =>
        `${colors[team.indexOf(name)]} ${(i * 360) / count}deg ${((i + 1) * 360) / count}deg`,
    )
    .join(",");
  function spin() {
    if (disabled || lock.current || !target || !names.includes(target)) return;
    lock.current = true;
    setSpinning(true);
    onStart();
    setRotation(landingRotation(names.indexOf(target), count));
    timer.current = setTimeout(
      () => {
        setSpinning(false);
        onFinish();
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 100
        : 3650,
    );
  }
  return (
    <section
      className={`wheel-card card ${disabled && !spinning ? "waiting" : ""}`}
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
          className="wheel"
          role="img"
          aria-label={`${title} choices: ${names.join(", ") || "Round complete"}`}
          style={{
            background: count ? `conic-gradient(${slices})` : "#24252c",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {names.map((name, i) => (
            <div
              key={name}
              className="wheel-label"
              style={{ transform: `rotate(${((i + 0.5) * 360) / count}deg)` }}
            >
              <span title={name}>
                {name.length > 16 ? name.slice(0, 15) + "…" : name}
              </span>
            </div>
          ))}
        </div>
        <div className="wheel-hub">{count ? "⌘" : "✓"}</div>
      </div>
      <button
        className={title === "Code Owner" ? "primary full" : "secondary full"}
        disabled={disabled || spinning || !count}
        onClick={spin}
      >
        {spinning ? "Spinning…" : `Spin ${title}`}
        <span aria-hidden="true">↻</span>
      </button>
      <p className="wheel-hint">
        {title === "Reviewer"
          ? "One teammate. One review. No self-reviews."
          : "A fresh perspective starts with a spin."}
      </p>
    </section>
  );
}

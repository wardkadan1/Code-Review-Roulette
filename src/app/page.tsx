"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ReviewRound from "@/components/ReviewRound";
import { generateRound, type Round } from "@/lib/assignment";
import { parseRound, STORAGE_KEY } from "@/lib/storage";
import TeamSetup from "@/components/TeamSetup";
export default function Page() {
  const [round, setRound] = useState<Round | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    // Restore after hydration, never during server rendering.
    const restore = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const saved = parseRound(raw);
        setRound(saved);
        if (raw && !saved) localStorage.removeItem(STORAGE_KEY);
      } catch {
        setStorageError(true);
      }
      setReady(true);
    };
    restore();
  }, []);
  const update = useCallback((next: Round | null) => {
    setRound(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-icon">⌘</span> review roulette
          <span className="version"> / v1.0</span>
        </Link>
        <span className="top-tag">
          <i /> A little chance. Better code.
        </span>
      </header>
      <main>
        <div className="hero">
          <span className="eyebrow">LESS DECIDING. MORE REVIEWING.</span>
          <h1>
            Code Review Roulette<span>.</span>
          </h1>
          <p>Spin. Match. Review. Ship better code.</p>
        </div>
        <div className="steps">
          <span className={!round ? "active" : ""}>
            01 <b>Set up your team</b>
          </span>
          <i />
          <span className={round && round.phase !== "complete" ? "active" : ""}>
            02 <b>Spin & match</b>
          </span>
          <i />
          <span className={round?.phase === "complete" ? "active" : ""}>
            03 <b>Ship better code</b>
          </span>
        </div>
        {storageError && (
          <p className="storage-note" role="status">
            Browser storage is unavailable. This round works, but may not
            survive a refresh.
          </p>
        )}
        {!ready ? (
          <p className="loading">Preparing your workspace…</p>
        ) : round ? (
          <ReviewRound
            round={round}
            onChange={update}
            onNew={() => update(null)}
          />
        ) : (
          <TeamSetup onStart={(names) => update(generateRound(names))} />
        )}
      </main>
      <footer>
        <span>Built for teams that build together.</span>
        <span>
          {round ? `${round.team.length} teammates` : "Your team"} <b>·</b>{" "}
          {round ? `${round.team.length} reviews` : "Fresh perspectives"}{" "}
          <b>·</b> Zero self-reviews
        </span>
      </footer>
    </div>
  );
}

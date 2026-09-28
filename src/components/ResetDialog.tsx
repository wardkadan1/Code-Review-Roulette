"use client";
import { useEffect, useRef } from "react";
export default function ResetDialog({
  onCancel,
  onReset,
}: {
  onCancel: () => void;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="reset-dialog card"
      aria-labelledby="reset-title"
      onCancel={onCancel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <h2 id="reset-title">Reset current round?</h2>
      <p>All current assignments will be cleared.</p>
      <div className="actions">
        <button autoFocus className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" onClick={onReset}>
          Reset
        </button>
      </div>
    </dialog>
  );
}

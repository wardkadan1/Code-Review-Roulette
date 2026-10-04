import { initials, type Assignment } from "@/lib/assignment";
export default function AssignmentList({
  assignments,
  total,
}: {
  assignments: Assignment[];
  total: number;
}) {
  return (
    <section className="results">
      <div className="results-heading">
        <h2>Review Assignments</h2>
        <span>
          {assignments.length} / {total} assigned
        </span>
      </div>
      <div className="result-labels">
        <span>CODE OWNER</span>
        <span>REVIEWER</span>
      </div>
      {!assignments.length ? (
        <div className="empty-results">
          <span>⇄</span>
          <p>
            Your first match is a spin away.
            <small>Completed assignments will appear here.</small>
          </p>
        </div>
      ) : (
        <ol>
          {assignments.map((p, i) => (
            <li className="result-row" key={p.owner}>
              <span className="row-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="person">
                <span className="avatar">{initials(p.owner)}</span>
                <span>{p.owner}</span>
              </div>
              <span className="row-arrow">→</span>
              <div className="person">
                <span className="avatar reviewer-avatar">
                  {initials(p.reviewer)}
                </span>
                <span>{p.reviewer}</span>
              </div>
              <span className="check">✓</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

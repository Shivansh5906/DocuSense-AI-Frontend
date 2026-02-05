export default function Summary({ summary }) {
  if (!summary) return null;

  return (
    <div className="card">
      <h2>📄 AI Generated Summary</h2>
      <pre className="summary-text">{summary}</pre>
    </div>
  );
}

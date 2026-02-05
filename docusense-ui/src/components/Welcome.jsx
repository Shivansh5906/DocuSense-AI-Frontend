function Welcome({ onNext }) {
  return (
    <div className="card">
      <h1>DocuSense AI</h1>
      <p>
        Upload documents. Ask questions.
        <br />
        Get instant answers.
      </p>

      <button className="btn" onClick={onNext}>
        Next →
      </button>
    </div>
  );
}

export default Welcome;

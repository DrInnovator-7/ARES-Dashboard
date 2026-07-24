function AIDecision({ status, vehicle, priority }) {
  return (
    <div className="card">

      <h3>🤖 AI Decision</h3>

      <p><strong>Status:</strong> {status}</p>

      <br />

      <p><strong>Vehicle:</strong> {vehicle}</p>

      <br />

      <p><strong>Priority:</strong> {priority}</p>

    </div>
  );
}

export default AIDecision;
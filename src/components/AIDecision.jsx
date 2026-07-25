function AIDecision({ status, vehicle, priority, location }) {
  return (
    <div className="card">

      <h3>🤖 AI Decision</h3>

      <p><strong>Status:</strong> {status}</p>

      <br />

      <p><strong>Vehicle:</strong> {vehicle}</p>

      <br />

      <p><strong>Priority:</strong> {priority}</p>

      <br />

      <p><strong>Location:</strong> {location}</p>

    </div>
  );
}

export default AIDecision;
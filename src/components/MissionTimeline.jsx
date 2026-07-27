function MissionTimeline({ timeline }) {
  return (
    <div className="card">

      <h3>📜 Mission Timeline</h3>

      {timeline.length === 0 ? (

        <p>No Mission Started</p>

      ) : (

        timeline.map((item, index) => (

          <p
            key={index}
            style={{
              marginBottom: "10px",
              borderBottom: "1px solid #334155",
              paddingBottom: "8px"
            }}
          >
            {item}
          </p>

        ))

      )}

    </div>
  );
}

export default MissionTimeline;
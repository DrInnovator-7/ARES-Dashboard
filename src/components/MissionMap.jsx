function MissionMap({ handleMission }) {

  const zones = [
    { name: "A1" },
    { name: "A2" },
    { name: "A3" },
    { name: "A4" },

    { name: "B1" },
    { name: "B2" },
    { name: "B3" },
    { name: "B4" },

    { name: "C1" },
    { name: "C2" },
    { name: "C3" },
    { name: "C4" },

    { name: "D1" },
    { name: "D2" },
    { name: "D3" },
    { name: "D4" }
  ];

  return (
    <div className="card">

      <h3>🌍 Tactical Mission Map</h3>

      <div className="tacticalMap">

        {zones.map((zone, index) => (

          <div
            key={index}
            className="mapCell"

            onClick={() => {

              if (zone.name === "A2")
                handleMission("fire");

              else if (zone.name === "C1")
                handleMission("flood");

            }}

          >

            {zone.name}

          </div>

        ))}

      </div>

    </div>
  );

}

export default MissionMap;
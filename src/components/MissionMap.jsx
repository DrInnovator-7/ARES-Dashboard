function MissionMap({ handleMission }) {

  const zones = [
    { name:"A1", color:"red" },
    { name:"A2", color:"green" },
    { name:"A3", color:"green" },
    { name:"A4", color:"green" },

    { name:"B1", color:"green" },
    { name:"B2", color:"yellow" },
    { name:"B3", color:"green" },
    { name:"B4", color:"green" },

    { name:"C1", color:"green" },
    { name:"C2", color:"green" },
    { name:"C3", color:"blue" },
    { name:"C4", color:"green" },

    { name:"D1", color:"green" },
    { name:"D2", color:"green" },
    { name:"D3", color:"green" },
    { name:"D4", color:"green" }
  ];

  return (

    <div className="card">

      <h3>🌍 Tactical Mission Map</h3>

      <div className="tacticalMap">

        {zones.map((zone,index)=>(

          <div

            key={index}

            className={`mapCell ${zone.color}`}

            onClick={()=>{

              if(zone.name==="A1")
                handleMission("survivor");

              else if(zone.name==="B2")
                handleMission("flood");

              else if(zone.name==="C3")
                handleMission("fire");

              else if(zone.name==="D4")
                handleMission("forest");

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

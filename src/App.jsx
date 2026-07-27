import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

import ConnectionStatus from "./components/ConnectionStatus";
import Navbar from "./components/Navbar";
import CameraFeed from "./components/CameraFeed";
import MissionMap from "./components/MissionMap";
import AIDecision from "./components/AIDecision";
import VehicleStatus from "./components/VehicleStatus";
import MissionTimeline from "./components/MissionTimeline";
import AlertBanner from "./components/AlertBanner";

function App() {

  const [mission, setMission] = useState({
    status: "Standby",
    vehicle: "None",
    priority: "Low",
    location: "-",
    destination: "-",
    vehicleStatus: "Idle",
    battery: "100%"
  });

  const [timeline, setTimeline] = useState([]);

  useEffect(() => {

    const missionRef = ref(db, "mission");

    const unsubscribe = onValue(missionRef, (snapshot) => {

      const data = snapshot.val();

      if (!data) return;

      const newMission = {
        status: data.status,
        vehicle: data.vehicle,
        priority: data.priority,
        location: data.zone,
        destination: data.zone,
        vehicleStatus: "Dispatched",
        battery: "95%"
      };

      setMission(newMission);

      const now = new Date().toLocaleTimeString();

      setTimeline(prev => {

        const latest =
          `${now} • ${data.status} • ${data.zone}`;

        if (prev.length > 0 && prev[0] === latest)
          return prev;

        return [latest, ...prev];

      });

    });

    return () => unsubscribe();

  }, []);

  function handleMission(type) {
    

    if (type === "fire") {

      setMission(prev => ({
        ...prev,
        status: "🔥 Fire Detected",
        destination: "A2"
      }));

    }

    if (type === "flood") {

      setMission(prev => ({
        ...prev,
        status: "🌊 Flood Detected",
        destination: "C1"
      }));

    }

  }

  return (

    <div className="dashboard">

      <Navbar />

      <AlertBanner mission={mission} />

      <div className="grid">

        <CameraFeed />

        <MissionMap
          handleMission={handleMission}
          mission={mission}
        />

        <AIDecision
          status={mission.status}
          vehicle={mission.vehicle}
          priority={mission.priority}
          location={mission.location}
        />

        <VehicleStatus mission={mission} />

        <ConnectionStatus />

        <MissionTimeline timeline={timeline} />
        

      </div>

    </div>

  );

}

export default App;
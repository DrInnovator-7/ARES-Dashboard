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

  onValue(missionRef, (snapshot) => {

    const data = snapshot.val();

    if (data) {

      setMission(prev => ({
        ...prev,
        status: data.status,
        vehicle: data.vehicle,
        priority: data.priority,
        destination: data.zone
      }));

    }

  });

}, []);

  function addTimeline(message) {
    const time = new Date().toLocaleTimeString();

    setTimeline(prev => [
      `${time}  ${message}`,
      ...prev
    ]);
  }

  function handleMission(type) {

    if (type === "survivor") {

      setMission({
        status: "🚨 Survivor Detected",
        vehicle: "🚑 Rover",
        priority: "High",
        destination: "Zone 1",
        vehicleStatus: "Moving",
        battery: "95%"
      });

      addTimeline("🚨 Survivor Detected");
      addTimeline("🚑 Rover Dispatched");
    }

    else if (type === "flood") {

     setMission({
  status: "🌊 Flood Detected",
  vehicle: "🚤 Rescue Boat",
  priority: "Critical",
  location: "C1",
  destination: "Zone C1",
  vehicleStatus: "Sailing",
  battery: "91%"
});

addTimeline("🌊 Flood Detected");
addTimeline("📍 Location: C1");
addTimeline("🚤 Boat Dispatched");
    }

    else if (type === "fire") {

      setMission({
  status: "🔥 Fire Detected",
  vehicle: "🚁 Drone",
  priority: "Critical",
  location: "A2",
  destination: "Zone A2",
  vehicleStatus: "Flying",
  battery: "88%"
});

addTimeline("🔥 Fire Detected");
addTimeline("📍 Location: A2");
addTimeline("🚁 Drone Dispatched");
    }

    else if (type === "forest") {

      setMission({
        status: "🌳 Forest Search",
        vehicle: "🚁 Drone",
        priority: "Medium",
        destination: "Zone 4",
        vehicleStatus: "Searching",
        battery: "93%"
      });

      addTimeline("🌳 Forest Search Started");
      addTimeline("🚁 Drone Dispatched");
    }

  }

  return (
    <div className="dashboard">

      <Navbar />
      <AlertBanner mission={mission} />

      <div className="grid">

        <CameraFeed />

        <MissionMap handleMission={handleMission} />

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
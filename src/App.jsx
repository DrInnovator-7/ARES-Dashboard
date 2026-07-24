import { useState } from "react";
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
    destination: "-",
    vehicleStatus: "Idle",
    battery: "100%"
  });

  const [timeline, setTimeline] = useState([]);

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
        destination: "Zone 2",
        vehicleStatus: "Sailing",
        battery: "91%"
      });

      addTimeline("🌊 Flood Detected");
      addTimeline("🚤 Boat Dispatched");
    }

    else if (type === "fire") {

      setMission({
        status: "🔥 Fire Detected",
        vehicle: "🚁 Drone",
        priority: "Critical",
        destination: "Zone 3",
        vehicleStatus: "Flying",
        battery: "88%"
      });

      addTimeline("🔥 Fire Detected");
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
        />

        <VehicleStatus mission={mission} />
        <ConnectionStatus />

        <MissionTimeline timeline={timeline} />

      </div>

    </div>
  );
}

export default App;
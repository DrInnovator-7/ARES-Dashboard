import { useEffect, useRef, useState } from "react";
import "./App.css";
import CommunicationVision from "./components/CommunicationVision";

const pages = [
  "Overview",
  "Mobility",
  "Health",
  "Location",
  "Camera",
  "Safety Engine",
  "Communication",
];

const modes = [
  {
    id: "JOYSTICK",
    icon: "🕹️",
    label: "Joystick",
    description: "Manual physical control",
  },
  {
    id: "EMG",
    icon: "💪",
    label: "EMG",
    description: "Muscle signal control",
  },
  {
    id: "EEG",
    icon: "🧠",
    label: "EEG",
    description: "Brain signal control",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [mode, setMode] = useState("JOYSTICK");
  const [movement, setMovement] = useState("STOPPED");
  const [battery, setBattery] = useState(100);
  const [speed, setSpeed] = useState(0);

  // Safety
  const [obstacle, setObstacle] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [safetyState, setSafetyState] = useState("ARMED");

  // Location
  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.209,
  });

  const [gpsConnected, setGpsConnected] = useState(true);

  // Camera
  const [cameraOnline, setCameraOnline] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [nightVision, setNightVision] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [events, setEvents] = useState([
    {
      time: "SYSTEM",
      text: "NEXUS initialized in simulation mode.",
    },
    {
      time: "SYSTEM",
      text: "Safety engine ready.",
    },
    {
      time: "SYSTEM",
      text: "No hardware connected.",
    },
  ]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // --------------------------------------------------
  // EVENT LOGGER
  // --------------------------------------------------

  const addEvent = (text) => {
    setEvents((current) =>
      [
        {
          time: new Date().toLocaleTimeString(),
          text,
        },
        ...current,
      ].slice(0, 8)
    );
  };

  // --------------------------------------------------
  // SAFETY STATE
  // --------------------------------------------------

  useEffect(() => {
    if (emergencyStop) {
      setSafetyState("E_STOP");
      setMovement("STOPPED");
      setSpeed(0);
      return;
    }

    if (obstacle) {
      setSafetyState("OBSTACLE");
      setMovement("STOPPED");
      setSpeed(0);
      return;
    }

    setSafetyState("ARMED");
  }, [obstacle, emergencyStop]);

  // --------------------------------------------------
  // MOBILITY COMMAND
  // --------------------------------------------------

  const command = (nextMovement) => {
    if (emergencyStop) {
      addEvent("Movement command blocked: emergency stop active.");
      return;
    }

    if (nextMovement !== "STOPPED" && obstacle) {
      setMovement("STOPPED");
      setSpeed(0);

      addEvent(
        `Safety engine blocked ${nextMovement.toLowerCase()} command: obstacle detected.`
      );

      return;
    }

    setMovement(nextMovement);

    if (nextMovement === "STOPPED") {
      setSpeed(0);
    } else {
      setSpeed(35);

      setBattery((value) => Math.max(0, value - 1));
    }

    addEvent(`Movement command: ${nextMovement}.`);
  };

  // --------------------------------------------------
  // CONTROL MODE
  // --------------------------------------------------

  const selectMode = (nextMode) => {
    setMode(nextMode);
    command("STOPPED");

    addEvent(`Control interface changed to ${nextMode}.`);
  };

  // --------------------------------------------------
  // KEYBOARD CONTROL
  // --------------------------------------------------

  useEffect(() => {
    const handleKey = (event) => {
      const keyMap = {
        ArrowUp: "FORWARD",
        ArrowDown: "BACKWARD",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        " ": "STOPPED",
      };

      if (keyMap[event.key]) {
        event.preventDefault();
        command(keyMap[event.key]);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  });

  // --------------------------------------------------
  // OBSTACLE SIMULATION
  // --------------------------------------------------

  const toggleObstacle = () => {
    const next = !obstacle;

    setObstacle(next);

    if (next) {
      setMovement("STOPPED");
      setSpeed(0);

      addEvent("Obstacle detected. Safety engine stopped mobility.");
    } else {
      addEvent("Obstacle cleared. Safety engine restored to ARMED state.");
    }
  };

  // --------------------------------------------------
  // EMERGENCY STOP
  // --------------------------------------------------

  const toggleEmergencyStop = () => {
    const next = !emergencyStop;

    setEmergencyStop(next);

    if (next) {
      setMovement("STOPPED");
      setSpeed(0);

      addEvent("EMERGENCY STOP activated.");
    } else {
      addEvent("Emergency stop released. Safety engine armed.");
    }
  };

  // --------------------------------------------------
  // GPS
  // --------------------------------------------------

  const simulateLocationUpdate = () => {
    setLocation((previous) => ({
      latitude: Number(
        (
          previous.latitude +
          (Math.random() - 0.5) * 0.0002
        ).toFixed(6)
      ),
      longitude: Number(
        (
          previous.longitude +
          (Math.random() - 0.5) * 0.0002
        ).toFixed(6)
      ),
    }));

    addEvent("Simulated GPS position updated.");
  };

  // --------------------------------------------------
  // CAMERA
  // --------------------------------------------------

  const startCamera = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOnline(true);
      setStreamActive(true);

      addEvent("Webcam connected to NEXUS.");
    } catch (error) {
      console.error(error);

      setCameraOnline(false);
      setStreamActive(false);

      if (error.name === "NotAllowedError") {
        setCameraError("Camera permission was denied.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was detected on this device.");
      } else {
        setCameraError("Unable to access the camera.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOnline(false);
    setStreamActive(false);

    addEvent("Webcam disconnected.");
  };

  const toggleStream = () => {
    if (!streamRef.current) {
      startCamera();
      return;
    }

    const videoTracks =
      streamRef.current.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setStreamActive(
      videoTracks.some((track) => track.enabled)
    );
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // --------------------------------------------------
  // NAVIGATION ICONS
  // --------------------------------------------------

  const getIcon = (page) => {
    const icons = {
      Overview: "⌂",
      Mobility: "◈",
      Health: "♥",
      Location: "⌖",
      Camera: "◉",
      "Safety Engine": "⚠",
      Communication: "☏",
    };

    return icons[page];
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="nexusApp">

      {/* TOP BAR */}

      <header className="topbar">

        <div className="topbarTitle">

          <div className="topbarSignal">
            N
          </div>

          <div>
            <strong>NEXUS</strong>
            <span>ASSISTIVE MOBILITY COMMAND SYSTEM</span>
          </div>

        </div>

        <div className="topbarRight">

          <button
            className="mobileMenuButton"
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            ☰
          </button>

          <div className="clock">
            {new Date().toLocaleTimeString()}
          </div>

          <div className="connection">
            <i></i>
            SYSTEM ONLINE
          </div>

        </div>

      </header>


      <div className="appLayout">

        {/* SIDEBAR */}

        <aside className={`sidebar ${mobileNavOpen ? "mobileOpen" : ""}`}>

          <div className="brandBlock">

            <div className="brandMark">
              N
            </div>

            <div>
              <strong>NEXUS</strong>
              <span>Command System</span>
            </div>

          </div>

          <button
            className="mobileCloseButton"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          >
            ×
          </button>


          <nav
            className="navMenu"
            aria-label="Primary navigation"
          >

            {pages.map((page) => (

              <button
                key={page}
                className={`navItem ${
                  activePage === page
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  navigateTo(page)
                }
              >

                <span>
                  {getIcon(page)}
                </span>

                {page}

              </button>

            ))}

          </nav>


          <div className="sidebarFooter">

            <span className="statusDot"></span>

            Simulation mode

          </div>

        </aside>

        {mobileNavOpen && (
          <button
            className="mobileOverlay"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        )}


        {/* WORKSPACE */}

        <main className="workspace">

          {/* ==================================================
              OVERVIEW
          ================================================== */}

          {activePage === "Overview" && (
            <>

              <section className="pageHeading">

                <div>

                  <p className="eyebrow">
                    AURA MOBILITY PLATFORM
                  </p>

                  <h1>
                    System Overview
                  </h1>

                  <p className="muted">
                    Central interface for mobility,
                    safety, health and connected systems.
                  </p>

                </div>

                <div className="systemBadge">
                  <span></span>
                  SYSTEM ONLINE
                </div>

              </section>


              <section className="statGrid">

                <div className="statCard">

                  <span className="statIcon">
                    ◈
                  </span>

                  <div>
                    <span>CONTROL MODE</span>
                    <strong>
                      {
                        modes.find(
                          (item) =>
                            item.id === mode
                        )?.label
                      }
                    </strong>
                  </div>

                </div>


                <div className="statCard">

                  <span className="statIcon">
                    ⚡
                  </span>

                  <div>
                    <span>BATTERY</span>
                    <strong>
                      {battery}%
                    </strong>
                  </div>

                </div>


                <div className="statCard">

                  <span className="statIcon">
                    ⌖
                  </span>

                  <div>
                    <span>GPS</span>

                    <strong>
                      {gpsConnected
                        ? "Connected"
                        : "Offline"}
                    </strong>

                  </div>

                </div>


                <div className="statCard">

                  <span className="statIcon">
                    ⚠
                  </span>

                  <div>

                    <span>SAFETY</span>

                    <strong>
                      {emergencyStop
                        ? "E-STOP"
                        : obstacle
                        ? "Obstacle"
                        : "Clear"}
                    </strong>

                  </div>

                </div>

              </section>


              <section className="contentGrid">

                {/* CONTROL */}

                <div className="panel controlPanel">

                  <div className="panelHeader">

                    <div>
                      <p className="eyebrow">
                        INPUT LAYER
                      </p>

                      <h2>
                        Control Interface
                      </h2>
                    </div>

                    <span className="livePill">
                      SIMULATED
                    </span>

                  </div>


                  <div className="modeGrid">

                    {modes.map((item) => (

                      <button
                        key={item.id}
                        className={`modeButton ${
                          mode === item.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          selectMode(item.id)
                        }
                      >

                        <span>
                          {item.icon}
                        </span>

                        <strong>
                          {item.label}
                        </strong>

                        <small>
                          {mode === item.id
                            ? "ACTIVE"
                            : "SELECT"}
                        </small>

                      </button>

                    ))}

                  </div>


                  <div className="commandArea">

                    <div>

                      <p className="eyebrow">
                        MOBILITY COMMAND
                      </p>

                      <h3>
                        {movement}
                      </h3>

                      <p className="muted">
                        Arrow keys also work in
                        simulation.
                      </p>

                    </div>


                    <div className="dPad">

                      <button
                        onClick={() =>
                          command("FORWARD")
                        }
                      >
                        ▲
                      </button>

                      <button
                        onClick={() =>
                          command("LEFT")
                        }
                      >
                        ◀
                      </button>

                      <button
                        className="stopButton"
                        onClick={() =>
                          command("STOPPED")
                        }
                      >
                        ■
                      </button>

                      <button
                        onClick={() =>
                          command("RIGHT")
                        }
                      >
                        ▶
                      </button>

                      <button
                        onClick={() =>
                          command("BACKWARD")
                        }
                      >
                        ▼
                      </button>

                    </div>

                  </div>

                </div>


                {/* HEALTH */}

                <div className="panel healthPanel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        HEALTH
                      </p>

                      <h2>
                        Vitals Monitor
                      </h2>

                    </div>

                    <span className="statePill safe">
                      READY
                    </span>

                  </div>


                  <div className="healthRows">

                    <div>
                      <span>
                        ♥ Heart Rate
                      </span>
                      <strong>
                        -- BPM
                      </strong>
                    </div>

                    <div>
                      <span>
                        ◌ SpO₂
                      </span>
                      <strong>
                        -- %
                      </strong>
                    </div>

                    <div>
                      <span>
                        ♨ Temperature
                      </span>
                      <strong>
                        -- °C
                      </strong>
                    </div>

                  </div>


                  

                </div>


                {/* CAMERA */}

                <div className="panel cameraPanel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        VISUAL FEED
                      </p>

                      <h2>
                        Camera
                      </h2>

                    </div>

                    <span className="statePill">
                      {cameraOnline
                        ? "ONLINE"
                        : "OFFLINE"}
                    </span>

                  </div>


                  <div className="cameraPlaceholder">

                    <span>
                      ◉
                    </span>

                    <strong>
                      {cameraOnline
                        ? "WEBCAM ONLINE"
                        : "NO CAMERA SIGNAL"}
                    </strong>

                    <small>
                      {cameraOnline
                        ? "Open Camera module for live feed"
                        : "Waiting for connected camera"}
                    </small>

                  </div>

                </div>


                {/* EVENTS */}

                <div className="panel eventPanel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        SYSTEM LOG
                      </p>

                      <h2>
                        Recent Events
                      </h2>

                    </div>

                    <span className="muted">
                      {events.length} events
                    </span>

                  </div>


                  <div className="eventList">

                    {events.map(
                      (event, index) => (

                        <div
                          className="eventRow"
                          key={`${event.time}-${index}`}
                        >

                          <span className="eventDot"></span>

                          <div>

                            <small>
                              {event.time}
                            </small>

                            <p>
                              {event.text}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              </section>

            </>
          )}


          {/* ==================================================
              MOBILITY
          ================================================== */}

          {activePage === "Mobility" && (
            <>

              <section className="pageHeading">

                <div>

                  <p className="eyebrow">
                    MOBILITY CORE
                  </p>

                  <h1>
                    Mobility Control
                  </h1>

                  <p className="muted">
                    Select the active human-machine
                    interface and control the mobility
                    system.
                  </p>

                </div>

                <div className="systemBadge">
                  <span></span>
                  MOBILITY READY
                </div>

              </section>


              <section className="panel mobilityMainPanel">

                <div className="panelHeader">

                  <div>

                    <p className="eyebrow">
                      CONTROL INTERFACE
                    </p>

                    <h2>
                      Select Control Mode
                    </h2>

                  </div>

                  <span className="livePill">
                    ACTIVE
                  </span>

                </div>


                <div className="modeGrid">

                  {modes.map((item) => (

                    <button
                      key={item.id}
                      className={`modeButton ${
                        mode === item.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectMode(item.id)
                      }
                    >

                      <span>
                        {item.icon}
                      </span>

                      <strong>
                        {item.label}
                      </strong>

                      <small>
                        {mode === item.id
                          ? "ACTIVE"
                          : item.description}
                      </small>

                    </button>

                  ))}

                </div>

              </section>


              <section className="mobilityContentGrid">

                <div className="panel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        COMMAND MANAGER
                      </p>

                      <h2>
                        Movement
                      </h2>

                    </div>

                  </div>


                  <div className="movementDisplay">

                    <span>
                      CURRENT COMMAND
                    </span>

                    <strong>
                      {movement}
                    </strong>

                    <small>
                      Source: {mode}
                    </small>

                  </div>


                  <div className="dPad largeDPad">

                    <button
                      onClick={() =>
                        command("FORWARD")
                      }
                    >
                      ▲
                    </button>

                    <button
                      onClick={() =>
                        command("LEFT")
                      }
                    >
                      ◀
                    </button>

                    <button
                      className="stopButton"
                      onClick={() =>
                        command("STOPPED")
                      }
                    >
                      ■
                    </button>

                    <button
                      onClick={() =>
                        command("RIGHT")
                      }
                    >
                      ▶
                    </button>

                    <button
                      onClick={() =>
                        command("BACKWARD")
                      }
                    >
                      ▼
                    </button>

                  </div>

                </div>


                <div className="panel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        MOBILITY STATUS
                      </p>

                      <h2>
                        Vehicle State
                      </h2>

                    </div>

                  </div>


                  <div className="healthRows">

                    <div>
                      <span>
                        CONTROL MODE
                      </span>

                      <strong>
                        {mode}
                      </strong>
                    </div>

                    <div>
                      <span>
                        MOVEMENT
                      </span>

                      <strong>
                        {movement}
                      </strong>
                    </div>

                    <div>
                      <span>
                        SPEED
                      </span>

                      <strong>
                        {speed}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        MOTOR SYSTEM
                      </span>

                      <strong>
                        READY
                      </strong>
                    </div>

                    <div>
                      <span>
                        SAFETY ENGINE
                      </span>

                      <strong>
                        {safetyState}
                      </strong>
                    </div>

                  </div>

                </div>

              </section>

            </>
          )}


          {/* ==================================================
              HEALTH
          ================================================== */}

          {activePage === "Health" && (
            <ModulePage
              eyebrow="HEALTH MONITORING"
              title="Vitals Monitor"
              description="Monitor physiological signals from the connected health sensors."
            >

              <div className="healthDashboard">

                <div className="healthMetric">
                  <span>HEART RATE</span>
                  <strong>--</strong>
                  <small>BPM</small>
                </div>

                <div className="healthMetric">
                  <span>SpO₂</span>
                  <strong>--</strong>
                  <small>%</small>
                </div>

                <div className="healthMetric">
                  <span>TEMPERATURE</span>
                  <strong>--</strong>
                  <small>°C</small>
                </div>

              </div>

              

            </ModulePage>
          )}


          {/* ==================================================
              LOCATION
          ================================================== */}

          {activePage === "Location" && (
            <>

              <section className="pageHeading">

                <div>

                  <p className="eyebrow">
                    NAVIGATION CORE
                  </p>

                  <h1>
                    Location Tracking
                  </h1>

                  <p className="muted">
                    Monitor the position and navigation
                    state of the mobility system.
                  </p>

                </div>

                <div className="systemBadge">
                  <span></span>
                  {gpsConnected
                    ? "GPS CONNECTED"
                    : "GPS OFFLINE"}
                </div>

              </section>


              <section className="statGrid">

                <div className="statCard">

                  <span className="statIcon">
                    N
                  </span>

                  <div>
                    <span>LATITUDE</span>

                    <strong>
                      {location.latitude.toFixed(6)}
                    </strong>
                  </div>

                </div>


                <div className="statCard">

                  <span className="statIcon">
                    E
                  </span>

                  <div>
                    <span>LONGITUDE</span>

                    <strong>
                      {location.longitude.toFixed(6)}
                    </strong>
                  </div>

                </div>


                <div className="statCard">

                  <span className="statIcon">
                    ↗
                  </span>

                  <div>
                    <span>SPEED</span>

                    <strong>
                      {speed === 0
                        ? "0.0"
                        : (speed * 0.12).toFixed(1)}{" "}
                      km/h
                    </strong>
                  </div>

                </div>


                <div className="statCard">

                  <span className="statIcon">
                    ⌖
                  </span>

                  <div>
                    <span>GPS STATUS</span>

                    <strong>
                      {gpsConnected
                        ? "CONNECTED"
                        : "OFFLINE"}
                    </strong>
                  </div>

                </div>

              </section>


              <section className="locationGrid">

                <div className="panel mapCard">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        LIVE POSITION
                      </p>

                      <h2>
                        Vehicle Map
                      </h2>

                    </div>

                    <span className="livePill">
                      TRACKING
                    </span>

                  </div>


                  <div className="map">

                    <div className="mapGrid"></div>

                    <div className="vehicleMarker">
                      <span></span>
                    </div>

                    <div className="mapCenterLabel">
                      NEXUS
                    </div>

                    <div className="mapCoordinates">
                      {location.latitude.toFixed(6)}
                      {" , "}
                      {location.longitude.toFixed(6)}
                    </div>

                  </div>

                </div>


                <div className="panel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        GPS TELEMETRY
                      </p>

                      <h2>
                        Navigation Data
                      </h2>

                    </div>

                  </div>


                  <div className="healthRows">

                    <div>
                      <span>
                        GPS MODULE
                      </span>

                      <strong>
                        {gpsConnected
                          ? "ONLINE"
                          : "OFFLINE"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        SATELLITES
                      </span>

                      <strong>
                        8
                      </strong>
                    </div>

                    <div>
                      <span>
                        POSITION FIX
                      </span>

                      <strong>
                        3D FIX
                      </strong>
                    </div>

                    <div>
                      <span>
                        MOVEMENT
                      </span>

                      <strong>
                        {movement}
                      </strong>
                    </div>

                    <div>
                      <span>
                        LAST UPDATE
                      </span>

                      <strong>
                        JUST NOW
                      </strong>
                    </div>

                  </div>


                  <button
                    className="toggleButton"
                    onClick={simulateLocationUpdate}
                  >
                    SIMULATE GPS UPDATE
                  </button>


                  <button
                    className="toggleButton"
                    onClick={() =>
                      setGpsConnected(
                        (previous) => !previous
                      )
                    }
                  >
                    {gpsConnected
                      ? "DISCONNECT GPS"
                      : "CONNECT GPS"}
                  </button>

                </div>

              </section>

            </>
          )}


          {/* ==================================================
              CAMERA
          ================================================== */}

          {activePage === "Camera" && (
            <>

              <section className="pageHeading">

                <div>

                  <p className="eyebrow">
                    VISUAL MONITORING
                  </p>

                  <h1>
                    Camera System
                  </h1>

                  <p className="muted">
                    Monitor the live webcam feed from
                    the NEXUS command center.
                  </p>

                </div>

                <div className="systemBadge">

                  <span></span>

                  {cameraOnline
                    ? "WEBCAM ONLINE"
                    : "WEBCAM OFFLINE"}

                </div>

              </section>


              <section className="cameraGrid">

                <div className="panel cameraFeedCard">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        LIVE FEED
                      </p>

                      <h2>
                        NEXUS Webcam
                      </h2>

                    </div>

                    <span className="livePill">
                      {streamActive
                        ? "STREAM ACTIVE"
                        : "STREAM PAUSED"}
                    </span>

                  </div>


                  <div
                    className={`cameraViewport ${
                      nightVision
                        ? "nightVision"
                        : ""
                    }`}
                  >

                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="webcamVideo"
                    ></video>


                    {!cameraOnline && (

                      <div className="cameraStartOverlay">

                        <div>

                          <span className="cameraStartIcon">
                            ◉
                          </span>

                          <strong>
                            WEBCAM READY
                          </strong>

                          <small>
                            Start the camera to begin
                            live monitoring
                          </small>

                          <button
                            onClick={startCamera}
                          >
                            START CAMERA
                          </button>

                          {cameraError && (
                            <p className="cameraError">
                              {cameraError}
                            </p>
                          )}

                        </div>

                      </div>

                    )}


                    {cameraOnline && (
                      <>

                        <div className="cameraScanlines"></div>

                        <div className="cameraCrosshair">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>

                        <div className="cameraCorner topLeft"></div>
                        <div className="cameraCorner topRight"></div>
                        <div className="cameraCorner bottomLeft"></div>
                        <div className="cameraCorner bottomRight"></div>

                        <div className="cameraOverlayTop">

                          <span>
                            WEBCAM-01
                          </span>

                          <span>
                            ● LIVE
                          </span>

                        </div>


                        <div className="cameraOverlayBottom">

                          <span>
                            LIVE WEBCAM
                          </span>

                          <span>
                            {movement}
                          </span>

                          <span>
                            NEXUS
                          </span>

                        </div>

                      </>
                    )}

                  </div>

                </div>


                <div className="panel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        CAMERA TELEMETRY
                      </p>

                      <h2>
                        Stream Status
                      </h2>

                    </div>

                  </div>


                  <div className="healthRows">

                    <div>
                      <span>
                        CAMERA SOURCE
                      </span>

                      <strong>
                        LAPTOP WEBCAM
                      </strong>
                    </div>

                    <div>
                      <span>
                        CAMERA
                      </span>

                      <strong>
                        {cameraOnline
                          ? "ONLINE"
                          : "OFFLINE"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        STREAM
                      </span>

                      <strong>
                        {streamActive
                          ? "ACTIVE"
                          : "PAUSED"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        RESOLUTION
                      </span>

                      <strong>
                        AUTO
                      </strong>
                    </div>

                    <div>
                      <span>
                        AUDIO
                      </span>

                      <strong>
                        DISABLED
                      </strong>
                    </div>

                    <div>
                      <span>
                        CONNECTION
                      </span>

                      <strong>
                        LOCAL
                      </strong>
                    </div>

                  </div>


                  <div className="cameraControls">

                    <button
                      onClick={
                        cameraOnline
                          ? toggleStream
                          : startCamera
                      }
                    >
                      {cameraOnline
                        ? streamActive
                          ? "PAUSE STREAM"
                          : "RESUME STREAM"
                        : "START CAMERA"}
                    </button>


                    <button
                      onClick={() =>
                        setNightVision(
                          (previous) =>
                            !previous
                        )
                      }
                      disabled={!cameraOnline}
                    >
                      {nightVision
                        ? "DAY MODE"
                        : "NIGHT VISION"}
                    </button>


                    <button
                      onClick={stopCamera}
                      disabled={!cameraOnline}
                    >
                      DISCONNECT CAMERA
                    </button>

                  </div>

                </div>

              </section>

            </>
          )}


          {/* ==================================================
              SAFETY ENGINE
          ================================================== */}

          {activePage === "Safety Engine" && (
            <>

              <section className="pageHeading">

                <div>

                  <p className="eyebrow">
                    SAFETY CORE
                  </p>

                  <h1>
                    Safety Engine
                  </h1>

                  <p className="muted">
                    Independent safety monitoring and
                    mobility command protection layer.
                  </p>

                </div>

                <div
                  className={`systemBadge ${
                    safetyState !== "ARMED"
                      ? "dangerBadge"
                      : ""
                  }`}
                >

                  <span></span>

                  {safetyState}

                </div>

              </section>


              <section className="safetyDashboard">

                <div className="panel safetyMainPanel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        SAFETY STATE
                      </p>

                      <h2>
                        Protection Status
                      </h2>

                    </div>

                    <span
                      className={`statePill ${
                        safetyState === "ARMED"
                          ? "safe"
                          : "danger"
                      }`}
                    >
                      {safetyState}
                    </span>

                  </div>


                  <div
                    className={`safetyIndicator ${
                      safetyState !== "ARMED"
                        ? "dangerIndicator"
                        : ""
                    }`}
                  >

                    <div className="safetyRing">

                      <span>
                        {safetyState === "ARMED"
                          ? "✓"
                          : "!"}
                      </span>

                    </div>

                    <strong>

                      {safetyState === "ARMED"
                        ? "Safety system armed"
                        : safetyState === "OBSTACLE"
                        ? "Obstacle detected"
                        : "Emergency stop active"}

                    </strong>

                    <small>

                      {safetyState === "ARMED"
                        ? "Mobility commands may pass through the safety layer."
                        : "Mobility commands are currently blocked."}

                    </small>

                  </div>

                </div>


                <div className="panel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        SAFETY INPUTS
                      </p>

                      <h2>
                        Sensors & Controls
                      </h2>

                    </div>

                  </div>


                  <div className="healthRows">

                    <div>
                      <span>
                        ULTRASONIC SENSOR
                      </span>

                      <strong>
                        {obstacle
                          ? "OBSTACLE"
                          : "CLEAR"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        EMERGENCY STOP
                      </span>

                      <strong>
                        {emergencyStop
                          ? "ACTIVE"
                          : "READY"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        COMMAND STATUS
                      </span>

                      <strong>
                        {obstacle ||
                        emergencyStop
                          ? "BLOCKED"
                          : "PERMITTED"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        MOTOR OUTPUT
                      </span>

                      <strong>
                        {movement === "STOPPED"
                          ? "STOPPED"
                          : "ACTIVE"}
                      </strong>
                    </div>

                  </div>

                </div>


                <div className="panel safetyControlsPanel">

                  <div className="panelHeader">

                    <div>

                      <p className="eyebrow">
                        SIMULATION
                      </p>

                      <h2>
                        Safety Controls
                      </h2>

                    </div>

                  </div>


                  <button
                    className={`toggleButton ${
                      obstacle
                        ? "dangerToggle"
                        : ""
                    }`}
                    onClick={toggleObstacle}
                  >
                    {obstacle
                      ? "CLEAR SIMULATED OBSTACLE"
                      : "SIMULATE OBSTACLE"}
                  </button>


                  <button
                    className={`toggleButton ${
                      emergencyStop
                        ? "dangerToggle emergencyButtonActive"
                        : "emergencyButton"
                    }`}
                    onClick={toggleEmergencyStop}
                  >
                    {emergencyStop
                      ? "RELEASE EMERGENCY STOP"
                      : "EMERGENCY STOP"}
                  </button>

                </div>

              </section>

            </>
          )}


          {/* ==================================================
              COMMUNICATION
          ================================================== */}

          {activePage === "Communication" && (
            <ModulePage
              eyebrow="ASSISTIVE COMMUNICATION"
              title="Communication"
              description="Camera-based hand gesture recognition for assistive communication."
            >
              <CommunicationVision onEvent={addEvent} />
            </ModulePage>
          )}

        </main>

      </div>

    </div>
  );
}


// --------------------------------------------------
// GENERIC MODULE PAGE
// --------------------------------------------------

function ModulePage({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <>

      <section className="pageHeading">

        <div>

          <p className="eyebrow">
            {eyebrow}
          </p>

          <h1>
            {title}
          </h1>

          <p className="muted">
            {description}
          </p>

        </div>

        <div className="systemBadge">
          <span></span>
          MODULE READY
        </div>

      </section>


      <section className="panel modulePanel">
        {children}
      </section>

    </>
  );
}

export default App;
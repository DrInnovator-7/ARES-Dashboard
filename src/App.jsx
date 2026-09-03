import { useEffect, useRef, useState } from "react";
import "./App.css";

const pages = [
  "Overview",
  "Mobility",
  "Health",
  "Location",
  "Camera",
  "Safety",
  "Communication",
];

const controlModes = ["Joystick", "EMG", "EEG"];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [controlMode, setControlMode] = useState("Joystick");
  const [movement, setMovement] = useState("STOP");
  const [speed, setSpeed] = useState(0);

  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.209,
  });

  const [gpsConnected, setGpsConnected] = useState(true);

  const [cameraOnline, setCameraOnline] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [nightVision, setNightVision] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleMovement = (command) => {
    setMovement(command);

    if (command === "STOP") {
      setSpeed(0);
    } else {
      setSpeed(35);
    }
  };

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
  };

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
    } catch (error) {
      console.error(error);

      setCameraOnline(false);
      setStreamActive(false);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "No camera was detected on this device."
        );
      } else {
        setCameraError(
          "Unable to access the camera."
        );
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

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brandMark">N</div>

          <div>
            <h1>NEXUS</h1>
            <span>COMMAND SYSTEM</span>
          </div>

        </div>

        <nav className="navigation">

          <p className="navLabel">SYSTEM</p>

          {pages.map((page) => (
            <button
              key={page}
              className={`navItem ${
                activePage === page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(page)
              }
            >
              <span className="navDot">•</span>
              {page}
            </button>
          ))}

        </nav>

        <div className="sidebarBottom">

          <div className="connection">

            <span className="statusDot"></span>

            <div>
              <strong>System Online</strong>
              <small>
                All core services operational
              </small>
            </div>

          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>

            <p className="sectionLabel">
              NEXUS /{" "}
              {activePage.toUpperCase()}
            </p>

            <h2>{activePage}</h2>

          </div>

          <div className="topStatus">

            <span className="statusDot"></span>

            ONLINE

          </div>

        </header>


        <section className="content">


          {/* ================= OVERVIEW ================= */}

          {activePage === "Overview" && (
            <>
              <div className="welcome">

                <div>

                  <p className="sectionLabel">
                    CENTRAL COMMAND
                  </p>

                  <h3>NEXUS Overview</h3>

                  <p>
                    Central interface for
                    monitoring and controlling
                    the assistive mobility system.
                  </p>

                </div>

                <div className="systemState">

                  <span className="statusDot"></span>

                  SYSTEM READY

                </div>

              </div>


              <div className="dashboardGrid">

                <div className="card">

                  <span className="cardLabel">
                    CONTROL MODE
                  </span>

                  <strong>
                    {controlMode.toUpperCase()}
                  </strong>

                  <small>
                    Active control interface
                  </small>

                </div>


                <div className="card">

                  <span className="cardLabel">
                    MOBILITY
                  </span>

                  <strong>{movement}</strong>

                  <small>
                    Current movement command
                  </small>

                </div>


                <div className="card">

                  <span className="cardLabel">
                    BATTERY
                  </span>

                  <strong>100%</strong>

                  <small>
                    Power system nominal
                  </small>

                </div>


                <div className="card">

                  <span className="cardLabel">
                    SAFETY
                  </span>

                  <strong>ACTIVE</strong>

                  <small>
                    Safety engine monitoring
                  </small>

                </div>

              </div>


              <div className="lowerGrid">

                <div className="largeCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        SYSTEM STATUS
                      </span>

                      <h3>Core Systems</h3>

                    </div>

                  </div>


                  <div className="systemList">

                    <div>
                      <span>
                        Mobility Controller
                      </span>

                      <b>READY</b>
                    </div>

                    <div>
                      <span>
                        Safety Engine
                      </span>

                      <b>ACTIVE</b>
                    </div>

                    <div>
                      <span>
                        Health Monitor
                      </span>

                      <b>READY</b>
                    </div>

                    <div>
                      <span>GPS</span>

                      <b>STANDBY</b>
                    </div>

                  </div>

                </div>


                <div className="largeCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        EVENTS
                      </span>

                      <h3>System Log</h3>

                    </div>

                  </div>


                  <div className="event">

                    <span className="eventTime">
                      NOW
                    </span>

                    <span>
                      NEXUS system initialized
                    </span>

                  </div>


                  <div className="event">

                    <span className="eventTime">
                      --:--
                    </span>

                    <span>
                      Mobility subsystem ready
                    </span>

                  </div>

                </div>

              </div>
            </>
          )}


          {/* ================= MOBILITY ================= */}

          {activePage === "Mobility" && (
            <>

              <div className="welcome">

                <div>

                  <p className="sectionLabel">
                    MOBILITY CORE
                  </p>

                  <h3>Mobility Control</h3>

                  <p>
                    Select the active
                    human-machine interface
                    and control the simulated
                    mobility system.
                  </p>

                </div>


                <div className="systemState">

                  <span className="statusDot"></span>

                  MOBILITY READY

                </div>

              </div>


              <div className="largeCard mobilityCard">

                <div className="cardHeader">

                  <div>

                    <span className="cardLabel">
                      CONTROL INTERFACE
                    </span>

                    <h3>
                      Select Control Mode
                    </h3>

                  </div>

                </div>


                <div className="modeGrid">

                  {controlModes.map((mode) => (

                    <button
                      key={mode}
                      className={`modeButton ${
                        controlMode === mode
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {

                        setControlMode(mode);

                        handleMovement("STOP");

                      }}
                    >

                      <span className="modeIcon">

                        {mode === "Joystick"
                          ? "🕹"
                          : mode === "EMG"
                          ? "💪"
                          : "🧠"}

                      </span>


                      <strong>{mode}</strong>


                      <small>

                        {mode === "Joystick"
                          ? "Manual physical control"
                          : mode === "EMG"
                          ? "Muscle signal control"
                          : "Brain signal control"}

                      </small>


                      {controlMode === mode && (

                        <span className="selectedLabel">
                          ACTIVE
                        </span>

                      )}

                    </button>

                  ))}

                </div>

              </div>


              <div className="mobilityGrid">

                <div className="largeCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        COMMAND MANAGER
                      </span>

                      <h3>Movement</h3>

                    </div>

                  </div>


                  <div className="movementDisplay">

                    <span className="movementLabel">
                      CURRENT COMMAND
                    </span>

                    <strong>
                      {movement}
                    </strong>

                    <span>
                      Source: {controlMode}
                    </span>

                  </div>


                  <div className="directionPad">

                    <div></div>

                    <button
                      onClick={() =>
                        handleMovement("FORWARD")
                      }
                    >
                      ↑
                    </button>

                    <div></div>


                    <button
                      onClick={() =>
                        handleMovement("LEFT")
                      }
                    >
                      ←
                    </button>


                    <button
                      className="stopButton"
                      onClick={() =>
                        handleMovement("STOP")
                      }
                    >
                      ■
                    </button>


                    <button
                      onClick={() =>
                        handleMovement("RIGHT")
                      }
                    >
                      →
                    </button>


                    <div></div>


                    <button
                      onClick={() =>
                        handleMovement("REVERSE")
                      }
                    >
                      ↓
                    </button>


                    <div></div>

                  </div>

                </div>


                <div className="largeCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        MOBILITY STATUS
                      </span>

                      <h3>Vehicle State</h3>

                    </div>

                  </div>


                  <div className="mobilityStats">

                    <div>
                      <span>
                        CONTROL MODE
                      </span>

                      <b>
                        {controlMode.toUpperCase()}
                      </b>
                    </div>

                    <div>
                      <span>MOVEMENT</span>
                      <b>{movement}</b>
                    </div>

                    <div>
                      <span>SPEED</span>
                      <b>{speed}%</b>
                    </div>

                    <div>
                      <span>MOTOR SYSTEM</span>
                      <b>READY</b>
                    </div>

                    <div>
                      <span>SAFETY ENGINE</span>
                      <b>ACTIVE</b>
                    </div>

                  </div>

                </div>

              </div>

            </>
          )}


          {/* ================= LOCATION ================= */}

          {activePage === "Location" && (
            <>

              <div className="welcome">

                <div>

                  <p className="sectionLabel">
                    NAVIGATION CORE
                  </p>

                  <h3>
                    Location Tracking
                  </h3>

                  <p>
                    Monitor the simulated
                    position and navigation
                    state of the mobility system.
                  </p>

                </div>


                <div className="systemState">

                  <span className="statusDot"></span>

                  GPS CONNECTED

                </div>

              </div>


              <div className="dashboardGrid locationStats">

                <div className="card">

                  <span className="cardLabel">
                    LATITUDE
                  </span>

                  <strong>
                    {location.latitude.toFixed(6)}
                  </strong>

                  <small>
                    Degrees North
                  </small>

                </div>


                <div className="card">

                  <span className="cardLabel">
                    LONGITUDE
                  </span>

                  <strong>
                    {location.longitude.toFixed(6)}
                  </strong>

                  <small>
                    Degrees East
                  </small>

                </div>


                <div className="card">

                  <span className="cardLabel">
                    SPEED
                  </span>

                  <strong>
                    {speed === 0
                      ? "0.0"
                      : (
                          speed * 0.12
                        ).toFixed(1)}
                  </strong>

                  <small>
                    km/h
                  </small>

                </div>


                <div className="card">

                  <span className="cardLabel">
                    GPS STATUS
                  </span>

                  <strong>
                    {gpsConnected
                      ? "CONNECTED"
                      : "OFFLINE"}
                  </strong>

                  <small>
                    {gpsConnected
                      ? "Signal available"
                      : "Signal unavailable"}
                  </small>

                </div>

              </div>


              <div className="locationGrid">

                <div className="largeCard mapCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        LIVE POSITION
                      </span>

                      <h3>Vehicle Map</h3>

                    </div>


                    <div className="mapStatus">

                      <span className="statusDot"></span>

                      TRACKING

                    </div>

                  </div>


                  <div className="map">

                    <div className="mapGrid"></div>


                    <div
                      className="vehicleMarker"
                      title="Simulated vehicle position"
                    >
                      <span></span>
                    </div>


                    <div className="mapCenterLabel">
                      AURA
                    </div>


                    <div className="mapCoordinates">

                      {location.latitude.toFixed(6)}
                      {" , "}
                      {location.longitude.toFixed(6)}

                    </div>

                  </div>

                </div>


                <div className="largeCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        GPS TELEMETRY
                      </span>

                      <h3>
                        Navigation Data
                      </h3>

                    </div>

                  </div>


                  <div className="gpsList">

                    <div>
                      <span>
                        GPS MODULE
                      </span>

                      <b>
                        {gpsConnected
                          ? "ONLINE"
                          : "OFFLINE"}
                      </b>
                    </div>

                    <div>
                      <span>SATELLITES</span>
                      <b>8</b>
                    </div>

                    <div>
                      <span>
                        POSITION FIX
                      </span>

                      <b>3D FIX</b>
                    </div>

                    <div>
                      <span>MOVEMENT</span>
                      <b>{movement}</b>
                    </div>

                    <div>
                      <span>HEADING</span>

                      <b>
                        {movement === "STOP"
                          ? "--"
                          : movement === "FORWARD"
                          ? "N"
                          : movement === "REVERSE"
                          ? "S"
                          : movement === "LEFT"
                          ? "W"
                          : "E"}
                      </b>

                    </div>

                    <div>
                      <span>
                        LAST UPDATE
                      </span>

                      <b>JUST NOW</b>
                    </div>

                  </div>


                  <button
                    className="updateLocationButton"
                    onClick={
                      simulateLocationUpdate
                    }
                  >
                    SIMULATE GPS UPDATE
                  </button>


                  <button
                    className="gpsToggleButton"
                    onClick={() =>
                      setGpsConnected(
                        (previous) =>
                          !previous
                      )
                    }
                  >
                    {gpsConnected
                      ? "DISCONNECT GPS"
                      : "CONNECT GPS"}
                  </button>

                </div>

              </div>

            </>
          )}


          {/* ================= CAMERA ================= */}

          {activePage === "Camera" && (
            <>

              <div className="welcome">

                <div>

                  <p className="sectionLabel">
                    VISUAL MONITORING
                  </p>

                  <h3>Camera System</h3>

                  <p>
                    Monitor the live webcam feed
                    from the NEXUS command center.
                  </p>

                </div>


                <div className="systemState">

                  <span
                    className={`statusDot ${
                      cameraOnline
                        ? ""
                        : "statusOffline"
                    }`}
                  ></span>

                  {cameraOnline
                    ? "WEBCAM ONLINE"
                    : "WEBCAM OFFLINE"}

                </div>

              </div>


              <div className="cameraGrid">


                {/* LIVE WEBCAM */}

                <div className="largeCard cameraFeedCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        LIVE FEED
                      </span>

                      <h3>
                        NEXUS Webcam
                      </h3>

                    </div>


                    <div className="cameraFeedStatus">

                      <span
                        className={`statusDot ${
                          streamActive
                            ? ""
                            : "statusOffline"
                        }`}
                      ></span>

                      {streamActive
                        ? "STREAM ACTIVE"
                        : "STREAM PAUSED"}

                    </div>

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
                            Start the camera to
                            begin live monitoring
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


                {/* CAMERA TELEMETRY */}

                <div className="largeCard">

                  <div className="cardHeader">

                    <div>

                      <span className="cardLabel">
                        CAMERA TELEMETRY
                      </span>

                      <h3>
                        Stream Status
                      </h3>

                    </div>

                  </div>


                  <div className="cameraStats">

                    <div>

                      <span>
                        CAMERA SOURCE
                      </span>

                      <b>
                        LAPTOP WEBCAM
                      </b>

                    </div>


                    <div>

                      <span>CAMERA</span>

                      <b>
                        {cameraOnline
                          ? "ONLINE"
                          : "OFFLINE"}
                      </b>

                    </div>


                    <div>

                      <span>STREAM</span>

                      <b>
                        {streamActive
                          ? "ACTIVE"
                          : "PAUSED"}
                      </b>

                    </div>


                    <div>

                      <span>RESOLUTION</span>

                      <b>
                        AUTO
                      </b>

                    </div>


                    <div>

                      <span>AUDIO</span>

                      <b>
                        DISABLED
                      </b>

                    </div>


                    <div>

                      <span>CONNECTION</span>

                      <b>
                        LOCAL
                      </b>

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

              </div>

            </>
          )}


          {/* ================= OTHER MODULES ================= */}

          {activePage !== "Overview" &&
            activePage !== "Mobility" &&
            activePage !== "Location" &&
            activePage !== "Camera" && (

              <div className="modulePage">

                <span className="sectionLabel">
                  NEXUS MODULE
                </span>

                <h3>{activePage}</h3>

                <p>
                  The{" "}
                  {activePage.toLowerCase()}{" "}
                  module is ready for development.
                </p>

                <div className="moduleStatus">

                  <span className="statusDot"></span>

                  MODULE INITIALIZED

                </div>

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default App;
import { useState } from "react";
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

  const handleMovement = (command) => {
    setMovement(command);

    if (command === "STOP") {
      setSpeed(0);
    } else {
      setSpeed(35);
    }
  };

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
                activePage === page ? "active" : ""
              }`}
              onClick={() => setActivePage(page)}
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
              <small>All core services operational</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="sectionLabel">
              NEXUS / {activePage.toUpperCase()}
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
                  <p className="sectionLabel">CENTRAL COMMAND</p>

                  <h3>NEXUS Overview</h3>

                  <p>
                    Central interface for monitoring and controlling the
                    assistive mobility system.
                  </p>
                </div>

                <div className="systemState">
                  <span className="statusDot"></span>
                  SYSTEM READY
                </div>
              </div>

              <div className="dashboardGrid">
                <div className="card">
                  <span className="cardLabel">CONTROL MODE</span>
                  <strong>{controlMode.toUpperCase()}</strong>
                  <small>Active control interface</small>
                </div>

                <div className="card">
                  <span className="cardLabel">MOBILITY</span>
                  <strong>{movement}</strong>
                  <small>Current movement command</small>
                </div>

                <div className="card">
                  <span className="cardLabel">BATTERY</span>
                  <strong>100%</strong>
                  <small>Power system nominal</small>
                </div>

                <div className="card">
                  <span className="cardLabel">SAFETY</span>
                  <strong>ACTIVE</strong>
                  <small>Safety engine monitoring</small>
                </div>
              </div>

              <div className="lowerGrid">
                <div className="largeCard">
                  <div className="cardHeader">
                    <div>
                      <span className="cardLabel">SYSTEM STATUS</span>
                      <h3>Core Systems</h3>
                    </div>
                  </div>

                  <div className="systemList">
                    <div>
                      <span>Mobility Controller</span>
                      <b>READY</b>
                    </div>

                    <div>
                      <span>Safety Engine</span>
                      <b>ACTIVE</b>
                    </div>

                    <div>
                      <span>Health Monitor</span>
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
                      <span className="cardLabel">EVENTS</span>
                      <h3>System Log</h3>
                    </div>
                  </div>

                  <div className="event">
                    <span className="eventTime">NOW</span>
                    <span>NEXUS system initialized</span>
                  </div>

                  <div className="event">
                    <span className="eventTime">--:--</span>
                    <span>Mobility subsystem ready</span>
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
                  <p className="sectionLabel">MOBILITY CORE</p>

                  <h3>Mobility Control</h3>

                  <p>
                    Select the active human-machine interface and control
                    the simulated mobility system.
                  </p>
                </div>

                <div className="systemState">
                  <span className="statusDot"></span>
                  MOBILITY READY
                </div>
              </div>

              {/* CONTROL MODE */}

              <div className="largeCard mobilityCard">
                <div className="cardHeader">
                  <div>
                    <span className="cardLabel">CONTROL INTERFACE</span>
                    <h3>Select Control Mode</h3>
                  </div>
                </div>

                <div className="modeGrid">
                  {controlModes.map((mode) => (
                    <button
                      key={mode}
                      className={`modeButton ${
                        controlMode === mode ? "selected" : ""
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

              {/* CONTROL + STATUS */}

              <div className="mobilityGrid">

                {/* MOVEMENT */}

                <div className="largeCard">
                  <div className="cardHeader">
                    <div>
                      <span className="cardLabel">COMMAND MANAGER</span>
                      <h3>Movement</h3>
                    </div>
                  </div>

                  <div className="movementDisplay">
                    <span className="movementLabel">
                      CURRENT COMMAND
                    </span>

                    <strong>{movement}</strong>

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

                {/* STATUS */}

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
                      <span>CONTROL MODE</span>
                      <b>{controlMode.toUpperCase()}</b>
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

          {/* ================= OTHER MODULES ================= */}

          {activePage !== "Overview" &&
            activePage !== "Mobility" && (
              <div className="modulePage">

                <span className="sectionLabel">
                  NEXUS MODULE
                </span>

                <h3>{activePage}</h3>

                <p>
                  The {activePage.toLowerCase()} module is
                  ready for development.
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
import { useEffect, useState } from "react";
function Navbar({ activePage, setActivePage }) 
function Navbar() {

  const [time, setTime] = useState("");

  useEffect(() => {

    const timer = setInterval(() => {

      const now = new Date();

      setTime(
        now.toLocaleTimeString()
      );

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  return (

    <header className="navbar">

      <h2>NEXUS</h2>

      <div className="navRight">

        <p className="online">🟢 SYSTEM ONLINE</p>

        <p className="clock">
          🕒 {time}
        </p>

      </div>

    </header>

  );
}

export default Navbar;
{navigation.map((item) => (
  <button
    key={item}
    onClick={() => setActivePage(item)}
    className={activePage === item ? "active" : ""}
  >
    {item}
  </button>
))}
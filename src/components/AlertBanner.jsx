function AlertBanner({ mission }) {

  if (mission.status === "Standby") {
    return null;
  }

  return (

    <div className="alertBanner">

      🚨 {mission.status}

    </div>

  );

}

export default AlertBanner;
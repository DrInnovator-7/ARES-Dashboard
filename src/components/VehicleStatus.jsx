function VehicleStatus({ mission }) {
  return (
    <div className="card">

      <h3>🚑 Vehicle Status</h3>

      <p><strong>Vehicle:</strong> {mission.vehicle}</p>
      <br />

      <p><strong>Status:</strong> {mission.vehicleStatus}</p>
      <br />

      <p><strong>Destination:</strong> {mission.destination}</p>
      <br />

      <p><strong>Battery:</strong> {mission.battery}</p>

    </div>
  );
}

export default VehicleStatus;
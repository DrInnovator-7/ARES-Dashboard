import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    databaseURL:
      "https://ares-command-centre-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const db = getDatabase();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { event } = req.body;

  let mission = {
    status: "Standby",
    vehicle: "None",
    priority: "Low",
    zone: "-"
  };

  switch (event) {
    case "fire":
      mission = {
        status: "Fire Detected",
        vehicle: "Drone",
        priority: "High",
        zone: "A2",
      };
      break;

    case "flood":
      mission = {
        status: "Flood Detected",
        vehicle: "Boat",
        priority: "High",
        zone: "C1",
      };
      break;

    case "health":
      mission = {
        status: "Medical Emergency",
        vehicle: "Ambulance",
        priority: "Medium",
        zone: "B2",
      };
      break;

    case "accident":
      mission = {
        status: "Road Accident",
        vehicle: "Rescue Unit",
        priority: "High",
        zone: "D2",
      };
      break;
  }

  await db.ref("mission").set(mission);

  return res.status(200).json({
    success: true,
    mission,
  });
}
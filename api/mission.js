import { cert, getApps, initializeApp } from "firebase-admin/app";
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
    return res.status(405).json({
      success: false,
      error: "Only POST requests are allowed",
    });
  }

  try {

    const { event } = req.body;

    let mission = {};

    switch (event) {

      case "fire":
        mission = {
          status: "Fire Detected",
          zone: "A2",
          vehicle: "Drone",
          priority: "High",
          timestamp: Date.now(),
        };
        break;

      case "flood":
        mission = {
          status: "Flood Detected",
          zone: "C1",
          vehicle: "Boat",
          priority: "High",
          timestamp: Date.now(),
        };
        break;

      case "health":
        mission = {
          status: "Medical Emergency",
          zone: "B2",
          vehicle: "Ambulance",
          priority: "Medium",
          timestamp: Date.now(),
        };
        break;

      case "accident":
        mission = {
          status: "Road Accident",
          zone: "D2",
          vehicle: "Rescue Unit",
          priority: "High",
          timestamp: Date.now(),
        };
        break;

      default:
        mission = {
          status: "No Emergency",
          zone: "-",
          vehicle: "None",
          priority: "Low",
          timestamp: Date.now(),
        };
    }

    await db.ref("mission").set(mission);

    return res.status(200).json({
      success: true,
      mission,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message,
    });

  }

}
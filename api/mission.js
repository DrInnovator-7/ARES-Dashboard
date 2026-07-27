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
      error: "Method Not Allowed",
    });
  }

  const { event } = req.body;

  let mission = {};

  switch (event) {

    case "fire":
      mission = {
        status: "🔥 Fire Detected",
        vehicle: "Fire Ambulance+Paramedics",
        priority: "High",
        zone: "A2",
      };
      break;

    case "flood":
      mission = {
        status: "🌊 Flood Detected",
        vehicle: "Rescue Boat+Paramedics",
        priority: "High",
        zone: "C1",
      };
      break;

    case "health":
      mission = {
        status: "❤️ Medical Emergency",
        vehicle: "Ambulance",
        priority: "Medium",
        zone: "B2",
      };
      break;

    case "accident":
      mission = {
        status: "🚗 Road Accident+Paramedics",
        vehicle: "Rescue Unit",
        priority: "High",
        zone: "D2",
      };
      break;

    default:
      mission = {
        status: "Standby",
        vehicle: "None",
        priority: "Low",
        zone: "-",
      };
  }

  // Save to Firebase
  await db.ref("mission").set({
    ...mission,
    timestamp: Date.now(),
  });

  // ==========================
  // Telegram Alert
  // ==========================

  try {

    const message =
`🚨 ARES COMMAND CENTRE 🚨

Emergency : ${mission.status}

Vehicle : ${mission.vehicle}

Priority : ${mission.priority}

Zone : ${mission.zone}

Time : ${new Date().toLocaleString("en-IN")}`;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

  } catch (err) {

    console.error("Telegram Error:", err);

  }

  res.status(200).json({
    success: true,
    mission,
  });

}
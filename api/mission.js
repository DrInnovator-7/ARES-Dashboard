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
  try {

    await db.ref("mission").set({
      status: "API TEST",
      zone: "A2",
      vehicle: "Drone",
      priority: "High",
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
}
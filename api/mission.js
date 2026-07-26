import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    databaseURL:
      "httpshttps://ares-command-centre-default-rtdb.asia-southeast1.firebasedatabase.app/",
  });
}

const db = getDatabase();

export default async function handler(req, res) {
  try {
    const missionRef = db.ref("mission");

    const snapshot = await missionRef.once("value");

    const data = snapshot.val();

    res.status(200).json({
      success: true,
      mission: data,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
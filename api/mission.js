export default function handler(req, res) {
  return res.status(200).json({
    projectId: process.env.FIREBASE_PROJECT_ID || "MISSING",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "MISSING",
    privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.length
      : 0,
  });
}
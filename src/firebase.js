import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC_kWG804bupadgmM24yHhskD2zCqQz-Bs",
  authDomain: "ares-command-centre.firebaseapp.com",
  databaseURL: "https://ares-command-centre-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ares-command-centre",
  storageBucket: "ares-command-centre.firebasestorage.app",
  messagingSenderId: "865363553171",
  appId: "1:865363553171:web:08c0bc03a6eae2f8321666"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_AR11nFpINW4Myj97TOssEUaUv2aIUUM",
  authDomain: "travel-planning-service.firebaseapp.com",
  projectId: "travel-planning-service",
  storageBucket: "travel-planning-service.firebasestorage.app",
  messagingSenderId: "705187950262",
  appId: "1:705187950262:web:780377afa40c8d1c670017",
  measurementId: "G-MGVZWWYS7T"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
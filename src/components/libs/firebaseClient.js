import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import { getFirestore } from "firebase/firestore"; 

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(cfg);

const firestoreDbId = process.env.NEXT_PUBLIC_FIREBASE_DB_ID || "vpworkload";

export const db = getFirestore(app, firestoreDbId);

// helper: hanya return messaging jika browser mendukung
export async function getMessagingIfSupported() {
  if (typeof window === "undefined") return null;
  try {
    const ok = await isSupported();
    return ok ? getMessaging(app) : null;
  } catch {
    return null;
  }
}

// src/lib/firebaseAuthAnon.js
import { getAuth, signInAnonymously } from "firebase/auth";
import { app } from "./firebaseClient";

const auth = getAuth(app);

export async function ensureAnonLogin() {
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}

export { auth };

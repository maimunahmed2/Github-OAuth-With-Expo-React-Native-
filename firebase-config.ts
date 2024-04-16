import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOndoBc7s1Ir3-W44sl_dRRHnaYOF0B6o",
  authDomain: "inkspire-d06a0.firebaseapp.com",
  projectId: "inkspire-d06a0",
  storageBucket: "inkspire-d06a0.appspot.com",
  messagingSenderId: "908967934475",
  appId: "1:908967934475:web:351bf93ec28fa44965e50e",
  measurementId: "G-NEFD0NT7W1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración para DATOS (Firestore)
// La autenticación ahora se maneja en firebaseAuthControlFile.js
const dataConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTH,
  projectId: import.meta.env.VITE_PROJECT,
  storageBucket: import.meta.env.VITE_STORAGE,
  messagingSenderId: import.meta.env.VITE_MESSAGING,
  appId: import.meta.env.VITE_APPID,
};

// Initialize Firebase app for data
const dataApp = initializeApp(dataConfig, 'dataApp');
const db = getFirestore(dataApp);

export { db };

// NOTA: Los servicios de autenticación y storage ahora están en:
// - Auth: firebaseAuthControlFile.js (Auth Central de ControlFile)
// - Storage: lib/controlFileStorage.js (ControlFile Storage)

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTH,
  projectId: import.meta.env.VITE_PROJECT,
  storageBucket: import.meta.env.VITE_STORAGE,
  messagingSenderId: import.meta.env.VITE_MESSAGING,
  appId: import.meta.env.VITE_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// LOS SERVICIOS

// Auth

// Login
export const onSigIn = async ({ email, password }) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res;
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

// Logout
export const logout = () => {
  signOut(auth);
};

// Login con Google
const googleProvider = new GoogleAuthProvider();
export const loginGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res;
  } catch (error) {
    console.error("Error during Google sign in:", error);
    throw error;
  }
};

// Registro
export const signUp = async ({ email, password }) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    return res;
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
};

// Olvidé la contraseña
export const forgotPassword = async (email) => {
  try {
    const res = await sendPasswordResetEmail(auth, email);
    return res;
  } catch (error) {
    console.error("Error during password reset:", error);
    throw error;
  }
};

// Storage

export const uploadFile = async (file) => {
  try {
    const storageRef = ref(storage, uuidv4());
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error;
  }
};

//no aprobados 
const handleDisapprove = async () => {
  if (!selectedCV) return;

  await updateDoc(doc(db, "cv", selectedCV.id), { estado: "no_aprobado" });
  setSelectedCV(null);
  setOpen(false);
  fetchPendingCVs(); // Refresh pending CVs
};

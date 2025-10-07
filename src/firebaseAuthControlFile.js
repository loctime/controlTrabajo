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

// Configuración del Auth Central de ControlFile
const authConfig = {
  apiKey: import.meta.env.VITE_CONTROLFILE_AUTH_APIKEY,
  authDomain: import.meta.env.VITE_CONTROLFILE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_CONTROLFILE_PROJECT_ID,
  appId: import.meta.env.VITE_CONTROLFILE_APP_ID,
};

export const authApp = initializeApp(authConfig, 'controlfileAuth');
export const auth = getAuth(authApp);

// SERVICIOS DE AUTENTICACIÓN

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


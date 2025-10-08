import { useState, useEffect } from "react";
import { createContext } from "react";
import { auth } from "../firebaseAuthControlFile";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { collection, doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

const AuthContextComponent = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true); // Añadido estado de carga

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener información adicional del usuario desde Firestore
          const userCollection = collection(db, "users");
          const userRef = doc(userCollection, firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          // Usuario está autenticado
          const userInfo = {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            rol: userDoc.exists() ? userDoc.data().rol : "user", // Obtener rol desde Firestore
          };
          
          setUser(userInfo);
          setIsLogged(true);
          // Guardar en localStorage como backup
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("isLogged", JSON.stringify(true));
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
          // En caso de error, usar solo los datos de Firebase Auth
          const userInfo = {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            rol: "user",
          };
          setUser(userInfo);
          setIsLogged(true);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("isLogged", JSON.stringify(true));
        }
      } else {
        // Usuario no está autenticado
        setUser(null);
        setIsLogged(false);
        localStorage.removeItem("userInfo");
        localStorage.removeItem("isLogged");
      }
      setLoading(false);
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const handleLogin = (userLogged) => {
    // Firebase Auth ya maneja la persistencia, solo actualizamos el contexto
    const userInfo = {
      email: userLogged.email,
      uid: userLogged.uid,
      displayName: userLogged.displayName,
      photoURL: userLogged.photoURL,
      rol: userLogged.rol || "user", // Incluir rol si existe
    };
    setUser(userInfo);
    setIsLogged(true);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("isLogged", JSON.stringify(true));
  };

  const logoutContext = () => {
    setUser(null);
    setIsLogged(false);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isLogged");
  };

  const data = {
    user,
    isLogged,
    handleLogin,
    logoutContext,
    loading, // Exportar el estado de carga
  };

  // Mostrar un loader mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export default AuthContextComponent;

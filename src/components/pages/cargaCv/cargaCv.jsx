import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseAuthControlFile";
import { addDoc, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { showAlert } from "../../../utils/swalConfig";
import { Button } from "../../common/Button";
import { useNavigate } from "react-router-dom";
import { getEstadosPorPais } from "../../../constants/locations";

// Hooks personalizados
import { useGeolocation } from "./hooks/useGeolocation";
import { useFileUpload } from "./hooks/useFileUpload";
import { useAutoFillUserData } from "./hooks/useAutoFillUserData";

// Servicios
import { sendRegistrationEmails } from "./services/emailService";

// Componentes de formulario
import { PersonalDataForm } from "./components/PersonalDataForm";
import { ProfessionalDataForm } from "./components/ProfessionalDataForm";
import { LocationForm } from "./components/LocationForm";
import { FilesForm } from "./components/FilesForm";

const CargaCv = ({ handleClose, setIsChange, updateDashboard }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentCv, setCurrentCv] = useState(null);
  const [newCv, setNewCv] = useState({
    Nombre: "",
    Apellido: "",
    Edad: "",
    categoriaGeneral: "",
    categoriaEspecifica: "",
    pais: "",
    estadoProvincia: "",
    ciudad: "",
    localidad: "",
    Email: "",
    Foto: "",
    cv: "",
    estado: "pendiente",
    versionCV: 1,
  });

  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const navigate = useNavigate();

  // Usar hooks personalizados
  const { detectingLocation, detectLocationManually } = useGeolocation();
  const { 
    isImageLoaded, 
    isCvLoaded, 
    loadingImage, 
    loadingCv, 
    handleFileChange 
  } = useFileUpload();
  const { autoFillData } = useAutoFillUserData(user, currentCv);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchCurrentCv(currentUser.uid);
        
        // Auto-completar datos del usuario si no tiene CV
        if (!currentCv) {
          try {
            const userData = await autoFillData();
            setNewCv(prevCv => ({
              ...prevCv,
              ...Object.fromEntries(
                Object.entries(userData).filter(([key, value]) => value && !prevCv[key])
              )
            }));
          } catch (error) {
            console.log('Error en auto-completado:', error);
          }
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCurrentCv = async (uid) => {
    try {
      const cvCollection = collection(db, "cv");
      const q = query(cvCollection, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const cvData = doc.data();
          setCurrentCv({ id: doc.id, ...cvData });
          setNewCv({ ...cvData, estado: "pendiente" });
          if (cvData.pais) {
            setEstadosDisponibles(getEstadosPorPais(cvData.pais));
          }
        });
      }
    } catch (error) {
      showAlert.error("Error", "Error al obtener el CV actual.");
    }
  };

  const handleChange = (e) => {
    setNewCv({ ...newCv, [e.target.name]: e.target.value });
  };

  const handlePaisChange = (e) => {
    const selectedPais = e.target.value;
    setNewCv({ ...newCv, pais: selectedPais, estadoProvincia: "", ciudad: "", localidad: "" });
    setEstadosDisponibles(getEstadosPorPais(selectedPais));
  };

  const handleEstadoChange = (e) => {
    setNewCv({ ...newCv, estadoProvincia: e.target.value, ciudad: "", localidad: "" });
  };

  const handleDetectLocation = async () => {
    const locationData = await detectLocationManually();
    if (locationData) {
      setNewCv(prevCv => ({
        ...prevCv,
        ...(locationData.ciudad && { ciudad: locationData.ciudad }),
        ...(locationData.estado && { estadoProvincia: locationData.estado }),
        ...(locationData.pais && { pais: locationData.pais })
      }));
      
      if (locationData.pais) {
        setEstadosDisponibles(getEstadosPorPais(locationData.pais));
      }
    }
  };

  const handleImageChange = (e) => {
    handleFileChange(e, "Foto", (url) => {
      setNewCv(prevCv => ({ ...prevCv, Foto: url }));
    });
  };

  const handleCvChange = (e) => {
    handleFileChange(e, "cv", (url) => {
      setNewCv(prevCv => ({ ...prevCv, cv: url }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      let docRef;
      
      if (currentCv) {
        docRef = doc(db, "cv", currentCv.id);
        await setDoc(docRef, { ...newCv, estado: "pendiente", uid: user.uid }, { merge: true });
      } else {
        const docSnap = await addDoc(collection(db, "cv"), { ...newCv, uid: user.uid });
        docRef = docSnap;
      }

      // Enviar correos electrónicos
      await sendRegistrationEmails(newCv);

      await showAlert.success(
        "CV Enviado",
        "Su CV está en revisión. Pronto estará disponible."
      );

      navigate("/");
      if (setIsChange) setIsChange((prev) => !prev);
      if (handleClose) handleClose();
      if (updateDashboard) updateDashboard();
    } catch (error) {
      console.error("Error al procesar el CV:", error);
      showAlert.error("Error", "Hubo un problema al cargar el CV. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: "100%", 
      maxWidth: 1200,
      mx: "auto",
      p: 3
    }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {currentCv ? "Actualizar tu perfil y CV" : "Cargar perfil y tu CV"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <PersonalDataForm newCv={newCv} handleChange={handleChange} />
          
          <Divider sx={{ my: 3 }} />
          
          <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
          
          <Divider sx={{ my: 3 }} />
          
          <LocationForm
            newCv={newCv}
            handleChange={handleChange}
            handlePaisChange={handlePaisChange}
            handleEstadoChange={handleEstadoChange}
            estadosDisponibles={estadosDisponibles}
            detectingLocation={detectingLocation}
            onDetectLocation={handleDetectLocation}
          />
          
          <Divider sx={{ my: 3 }} />
          
          <FilesForm
            onImageChange={handleImageChange}
            onCvChange={handleCvChange}
            loadingImage={loadingImage}
            loadingCv={loadingCv}
          />
          
          {!isLoading && isImageLoaded && isCvLoaded && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                type="submit" 
                size="large"
                sx={{ px: 6, py: 1.5 }}
              >
                Finalizar Carga
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CargaCv;

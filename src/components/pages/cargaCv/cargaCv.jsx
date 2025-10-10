import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Divider, Tabs, Tab } from "@mui/material";
import { db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseAuthControlFile";
import { addDoc, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { showAlert } from "../../../utils/swalConfig";
import { Button } from "../../common/Button";
import { useNavigate } from "react-router-dom";

// Hooks personalizados
import { useFileUpload } from "./hooks/useFileUpload";
import { useAutoFillUserData } from "./hooks/useAutoFillUserData";

// Servicios
import { sendRegistrationEmails } from "./services/emailService";

// Componentes de formulario
import { PersonalDataForm } from "./components/PersonalDataForm";
import { ProfessionalDataForm } from "./components/ProfessionalDataForm";
import { LocationForm } from "./components/LocationForm";
import { FilesForm } from "./components/FilesForm";
import { ContactForm } from "./components/ContactForm";
import { ExperienceForm } from "./components/ExperienceForm";
import { EducationForm } from "./components/EducationForm";
import { SkillsForm } from "./components/SkillsForm";
import { LanguagesForm } from "./components/LanguagesForm";
import { CertificationsForm } from "./components/CertificationsForm";
import { ProjectsForm } from "./components/ProjectsForm";
import { ReferencesForm } from "./components/ReferencesForm";
import { TemplateSelector } from "./components/TemplateSelector";
import CVPreview from "./components/CVPreview";
import { useFormValidation } from "./hooks/useFormValidation";

const CargaCv = ({ handleClose, setIsChange, updateDashboard }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentCv, setCurrentCv] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('moderna');
  const [showPreview, setShowPreview] = useState(false);
  const [newCv, setNewCv] = useState({
    // Datos actuales
    Nombre: "",
    Apellido: "",
    Edad: "",
    categoriaGeneral: "",
    categoriaEspecifica: "",
    ciudad: "",
    localidad: "",
    Email: "",
    Foto: "",
    cv: "",
    estado: "pendiente",
    versionCV: 1,
    
    // Nuevos campos expandidos
    telefono: "",
    direccion: "",
    linkedin: "",
    sitioWeb: "",
    perfilProfesional: "",
    
    // Arrays de objetos
    experiencias: [],
    educacion: [],
    habilidades: [],
    idiomas: [],
    certificaciones: [],
    proyectos: [],
    referencias: [],
    
    // Configuración de CV generado
    cvGenerado: false,
    plantillaSeleccionada: "moderna",
    cvPdfUrl: ""
  });

  const navigate = useNavigate();

  // Usar hooks personalizados
  const { 
    isImageLoaded, 
    isCvLoaded, 
    loadingImage, 
    loadingCv, 
    handleFileChange 
  } = useFileUpload();
  const { autoFillData } = useAutoFillUserData(user, currentCv);
  const { validateForm, getValidationSummary } = useFormValidation();

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
        });
      }
    } catch (error) {
      showAlert.error("Error", "Error al obtener el CV actual.");
    }
  };

  const handleChange = (e) => {
    setNewCv({ ...newCv, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    setNewCv(prev => ({ ...prev, plantillaSeleccionada: template }));
  };

  // Componente TabPanel
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

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

    // Validar formulario completo
    const mode = tabValue === 0 ? 'generator' : 'upload';
    const validation = validateForm(newCv, mode);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).flat().join(', ');
      showAlert.error("Error de validación", `Por favor corrige los siguientes errores: ${errorMessages}`);
      return;
    }

    // Mostrar warnings si existen
    if (validation.warnings && Object.keys(validation.warnings).length > 0) {
      const warningMessages = Object.values(validation.warnings).flat().join(', ');
      showAlert.warning("Advertencias", `Ten en cuenta: ${warningMessages}`);
    }

    setIsLoading(true);
    try {
      let docRef;
      
      // Preparar datos según el modo
      const cvData = {
        ...newCv,
        estado: "pendiente",
        uid: user.uid,
        cvGenerado: tabValue === 0, // true si es generador, false si es subida
        plantillaSeleccionada: tabValue === 0 ? selectedTemplate : null,
        fechaCreacion: new Date().toISOString(),
        versionCV: currentCv ? (currentCv.versionCV || 1) + 1 : 1
      };
      
      if (currentCv) {
        docRef = doc(db, "cv", currentCv.id);
        await setDoc(docRef, cvData, { merge: true });
      } else {
        const docSnap = await addDoc(collection(db, "cv"), cvData);
        docRef = docSnap;
      }

      // Enviar correos electrónicos
      await sendRegistrationEmails(newCv);

      const mensaje = tabValue === 0 
        ? "Tu CV profesional ha sido creado exitosamente. Está en revisión y pronto estará disponible."
        : "Tu CV ha sido enviado exitosamente. Está en revisión y pronto estará disponible.";

      await showAlert.success(
        "CV Procesado",
        mensaje
      );

      navigate("/");
      if (setIsChange) setIsChange((prev) => !prev);
      if (handleClose) handleClose();
      if (updateDashboard) updateDashboard();
    } catch (error) {
      console.error("Error al procesar el CV:", error);
      showAlert.error("Error", "Hubo un problema al procesar el CV. Inténtalo nuevamente.");
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

        {/* Sistema de Pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab 
              label="🎨 Generar CV Profesional" 
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="📄 Subir mi propio CV" 
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                textTransform: 'none'
              }} 
            />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Pestaña 1: Generador de CV */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', textAlign: 'center' }}>
              Crea tu CV profesional paso a paso
            </Typography>
            
            <PersonalDataForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <ContactForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <LocationForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <ExperienceForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <EducationForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <SkillsForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <LanguagesForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <CertificationsForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <ProjectsForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <ReferencesForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <TemplateSelector 
              selectedTemplate={selectedTemplate} 
              onTemplateChange={handleTemplateChange} 
            />
            <Divider sx={{ my: 3 }} />
            
            {/* Solo foto de perfil para el generador */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📸 Foto de Perfil (Opcional)
              </Typography>
              <Box sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="photo-input"
                />
                <label htmlFor="photo-input">
                  <Button
                    variant="outlined"
                    component="span"
                    sx={{ cursor: 'pointer' }}
                  >
                    Seleccionar Foto
                  </Button>
                </label>
                {loadingImage && <Typography sx={{ mt: 1 }}>Cargando...</Typography>}
              </Box>
            </Box>
            
            {!isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => setShowPreview(true)}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Vista Previa
                </Button>
                <Button 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  sx={{ px: 6, py: 1.5 }}
                >
                  Generar CV Profesional
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Pestaña 2: Subida tradicional */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', textAlign: 'center' }}>
              Sube tu CV en formato PDF
            </Typography>
            
            <PersonalDataForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
            <Divider sx={{ my: 3 }} />
            
            <LocationForm newCv={newCv} handleChange={handleChange} />
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
          </TabPanel>
        </Box>
      </Paper>

      {/* Modal de Vista Previa */}
      <CVPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        cvData={newCv}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
    </Box>
  );
};

export default CargaCv;

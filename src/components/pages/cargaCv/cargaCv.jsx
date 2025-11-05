import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseAuthControlFile";
import { collection, query, where, getDocs } from "firebase/firestore";
import { showAlert } from "../../../utils/swalConfig";
import { useNavigate } from "react-router-dom";

// Hooks personalizados
import { useFileUpload } from "./hooks/useFileUpload";
import { useAutoFillUserData } from "./hooks/useAutoFillUserData";
import { useTestData } from "./hooks/useTestData";
import { useFormValidation } from "./hooks/useFormValidation";

// Servicios
import { cvSubmissionService } from "./services/cvSubmissionService";

// Componentes
import { CVGeneratorTab } from "./components/CVGeneratorTab";
import { CVUploadTab } from "./components/CVUploadTab";
import { UtilityButtons } from "./components/UtilityButtons";
import CVPreview from "./components/CVPreview";

// Componente TabPanel fuera del componente principal para evitar recreaciones
const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

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
    handleFileChange,
    isProcessing,
    showImagePreview,
    selectedImageFile,
    setShowImagePreview,
    setSelectedImageFile,
    processAndConfirmImage
  } = useFileUpload();
  const { autoFillData } = useAutoFillUserData(user, currentCv);
  const { validateForm, getValidationSummary } = useFormValidation();
  const { fillWithTestData, fillWithExtensiveTestData, clearForm } = useTestData();

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

  // Memoizar handleChange para evitar recreaciones y pérdida de foco
  const handleChange = useCallback((e) => {
    setNewCv(prevCv => ({ ...prevCv, [e.target.name]: e.target.value }));
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleTemplateChange = useCallback((template) => {
    setSelectedTemplate(template);
    setNewCv(prev => ({ ...prev, plantillaSeleccionada: template }));
  }, []);

    const handleImageChange = useCallback((e) => {
      handleFileChange(e, "Foto", (result) => {
        const url = result && result.url ? result.url : result; // Fallback para compatibilidad
        const metadata = result && result.metadata ? result.metadata : null;
        setNewCv(prevCv => ({
          ...prevCv,
          Foto: url,
          ...(metadata && {
            Foto_metadata: {
              fileId: metadata.fileId,
              name: metadata.name,
              size: metadata.size,
              syncedAt: new Date().toISOString()
            }
          })
        }));
      });
    }, [handleFileChange]);

  const handleImageProcessed = useCallback(async (processedFile) => {
    try {
      const url = await handleFileChange({ target: { files: [processedFile] } }, "Foto", (url) => {
        setNewCv(prev => ({ ...prev, Foto: url }));
      });
      if (url) {
        setNewCv(prev => ({ ...prev, Foto: url }));
      }
    } catch (error) {
      console.error('Error al procesar imagen:', error);
    }
  }, [handleFileChange]);

  const handleCancelPreview = useCallback(() => {
    setShowImagePreview(false);
    setSelectedImageFile(null);
  }, [setShowImagePreview, setSelectedImageFile]);

    const handleCvChange = useCallback((e) => {
      handleFileChange(e, "cv", (result) => {
        const url = result && result.url ? result.url : result; // Fallback para compatibilidad
        const metadata = result && result.metadata ? result.metadata : null;
        setNewCv(prevCv => ({
          ...prevCv,
          cv: url,
          ...(metadata && {
            cv_metadata: {
              fileId: metadata.fileId,
              name: metadata.name,
              size: metadata.size,
              syncedAt: new Date().toISOString()
            }
          })
        }));
      });
    }, [handleFileChange]);

  // Handlers para botones de utilidad
  const handleFillTestData = useCallback(() => fillWithTestData(setNewCv), [fillWithTestData]);
  const handleFillExtensiveData = useCallback(() => fillWithExtensiveTestData(setNewCv), [fillWithExtensiveTestData]);
  const handleClearForm = useCallback(() => clearForm(setNewCv), [clearForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validar formulario completo
    const mode = tabValue === 0 ? 'upload' : 'generator';
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
      const result = await cvSubmissionService.submitCV({
        newCv,
        user,
        currentCv,
        tabValue,
        selectedTemplate,
        handleFileChange
      });

      await showAlert.success("CV Procesado", result.message);

      navigate("/");
      if (setIsChange) setIsChange((prev) => !prev);
      if (handleClose) handleClose();
      if (updateDashboard) updateDashboard();
    } catch (error) {
      showAlert.error("Error", error.message || "Hubo un problema al procesar el CV. Inténtalo nuevamente.");
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ flex: 1, textAlign: 'center' }}>
            {currentCv ? "Actualizar tu perfil y CV" : "Cargar perfil y tu CV"}
          </Typography>
          
          <UtilityButtons
            currentCv={currentCv}
            onFillTestData={handleFillTestData}
            onFillExtensiveData={handleFillExtensiveData}
            onClearForm={handleClearForm}
          />
        </Box>

        {/* Sistema de Pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab 
              label="📄 Subir mi propio CV" 
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="🎨 Generar CV Profesional" 
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                textTransform: 'none'
              }} 
            />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Pestaña 1: Subida tradicional */}
          <TabPanel value={tabValue} index={0}>
            <CVUploadTab
              newCv={newCv}
              handleChange={handleChange}
              onImageChange={handleImageChange}
              onCvChange={handleCvChange}
              loadingImage={loadingImage}
              loadingCv={loadingCv}
              isImageLoaded={isImageLoaded}
              isCvLoaded={isCvLoaded}
              isLoading={isLoading}
              showPreview={showImagePreview}
              selectedFile={selectedImageFile}
              onImageProcessed={handleImageProcessed}
              onCancelPreview={handleCancelPreview}
            />
          </TabPanel>

          {/* Pestaña 2: Generador de CV */}
          <TabPanel value={tabValue} index={1}>
            <CVGeneratorTab
              newCv={newCv}
              handleChange={handleChange}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              onImageChange={handleImageChange}
              loadingImage={loadingImage}
              currentCv={currentCv}
              isLoading={isLoading}
              onPreview={() => setShowPreview(true)}
              onSubmit={handleSubmit}
            />
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

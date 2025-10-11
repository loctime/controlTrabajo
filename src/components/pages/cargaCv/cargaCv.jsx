import React, { useState, useEffect, useCallback } from "react";
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
import { pdfGeneratorService } from "./services/pdfGeneratorService";

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
    handleFileChange(e, "Foto", (url) => {
      setNewCv(prevCv => ({ ...prevCv, Foto: url }));
    });
  }, [handleFileChange]);

  const handleCvChange = useCallback((e) => {
    handleFileChange(e, "cv", (url) => {
      setNewCv(prevCv => ({ ...prevCv, cv: url }));
    });
  }, [handleFileChange]);

  // Función para llenar el formulario con datos de prueba
  const fillWithTestData = useCallback(() => {
    const testData = {
      // Datos personales
      Nombre: "Juan Carlos",
      Apellido: "González Pérez",
      Edad: "28",
      Email: "juan.gonzalez@email.com",
      
      // Información de contacto
      telefono: "+34 612 345 678",
      direccion: "Calle Mayor 123, 3º A, Madrid",
      linkedin: "https://linkedin.com/in/juancgonzalez",
      sitioWeb: "https://juan-gonzalez.dev",
      perfilProfesional: "Desarrollador Frontend con 5 años de experiencia en React, Vue.js y tecnologías web modernas. Apasionado por crear interfaces de usuario intuitivas y experiencias digitales excepcionales.",
      
      // Información profesional
      categoriaGeneral: "Informática y Tecnología",
      categoriaEspecifica: "Desarrollador Frontend",
      
      // Ubicación
      ciudad: "San Nicolás",
      localidad: "Centro",
      
      // Experiencias laborales
      experiencias: [
        {
          id: "exp-1",
          cargo: "Desarrollador Frontend Senior",
          empresa: "TechCorp Solutions",
          ubicacion: "San Nicolás, Argentina",
          fechaInicio: "01/2022",
          fechaFin: "Actualidad",
          descripcion: "Liderazgo técnico en el desarrollo de aplicaciones web con React y TypeScript. Implementación de arquitecturas escalables y mejora de rendimiento en un 40%. Colaboración con equipos de diseño y backend para entregar productos de alta calidad.",
          esActual: true
        },
        {
          id: "exp-2",
          cargo: "Desarrollador Frontend",
          empresa: "Digital Agency Pro",
          ubicacion: "Ramallo, Argentina",
          fechaInicio: "03/2020",
          fechaFin: "12/2021",
          descripcion: "Desarrollo de sitios web y aplicaciones e-commerce para clientes internacionales. Uso de Vue.js, Nuxt.js y integración con APIs REST. Trabajo en equipo ágil con metodologías Scrum.",
          esActual: false
        },
        {
          id: "exp-3",
          cargo: "Desarrollador Junior",
          empresa: "StartupTech",
          ubicacion: "San Nicolás, Argentina",
          fechaInicio: "06/2019",
          fechaFin: "02/2020",
          descripcion: "Desarrollo de componentes React reutilizables y mantenimiento de código legacy. Participación en code reviews y mejora continua de procesos de desarrollo.",
          esActual: false
        }
      ],
      
      // Educación
      educacion: [
        {
          id: "edu-1",
          titulo: "Grado en Ingeniería Informática",
          institucion: "Universidad Nacional de Rosario",
          ubicacion: "San Nicolás, Argentina",
          fechaInicio: "09/2015",
          fechaFin: "06/2019",
          descripcion: "Especialización en Ingeniería del Software. Proyecto final: Aplicación web para gestión de inventarios con React y Node.js. Nota media: 8.2"
        },
        {
          id: "edu-2",
          titulo: "Certificación AWS Cloud Practitioner",
          institucion: "Amazon Web Services",
          ubicacion: "Online",
          fechaInicio: "01/2023",
          fechaFin: "03/2023",
          descripcion: "Fundamentos de computación en la nube, servicios AWS y mejores prácticas de seguridad."
        }
      ],
      
      // Habilidades
      habilidades: [
        { id: "skill-1", nombre: "React", nivel: "Experto" },
        { id: "skill-2", nombre: "TypeScript", nivel: "Avanzado" },
        { id: "skill-3", nombre: "JavaScript", nivel: "Experto" },
        { id: "skill-4", nombre: "Vue.js", nivel: "Avanzado" },
        { id: "skill-5", nombre: "Node.js", nivel: "Intermedio" },
        { id: "skill-6", nombre: "CSS/SASS", nivel: "Avanzado" },
        { id: "skill-7", nombre: "Git", nivel: "Avanzado" },
        { id: "skill-8", nombre: "Figma", nivel: "Intermedio" },
        { id: "skill-9", nombre: "Trabajo en Equipo", nivel: "Avanzado" },
        { id: "skill-10", nombre: "Resolución de Problemas", nivel: "Avanzado" }
      ],
      
      // Idiomas
      idiomas: [
        { id: "lang-1", idioma: "Español", nivel: "Nativo" },
        { id: "lang-2", idioma: "Inglés", nivel: "Avanzado" },
        { id: "lang-3", idioma: "Francés", nivel: "Básico" }
      ],
      
      // Certificaciones
      certificaciones: [
        {
          id: "cert-1",
          nombre: "AWS Cloud Practitioner",
          institucion: "Amazon Web Services",
          fecha: "03/2023",
          url: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
        },
        {
          id: "cert-2",
          nombre: "React Developer Certification",
          institucion: "Meta (Facebook)",
          fecha: "08/2022",
          url: ""
        }
      ],
      
      // Proyectos
      proyectos: [
        {
          id: "proj-1",
          nombre: "E-commerce Platform",
          descripcion: "Plataforma de comercio electrónico completa desarrollada con React, Node.js y MongoDB. Incluye sistema de pagos, gestión de inventarios y panel administrativo. Proyecto personal con más de 1000 usuarios registrados.",
          tecnologias: "React, Node.js, MongoDB, Stripe, AWS",
          url: "https://github.com/juan-gonzalez/ecommerce-platform"
        },
        {
          id: "proj-2",
          nombre: "Task Management App",
          descripcion: "Aplicación de gestión de tareas con interfaz drag-and-drop, notificaciones en tiempo real y colaboración en equipo. Desarrollada con Vue.js y Firebase.",
          tecnologias: "Vue.js, Firebase, Vuex, CSS Grid",
          url: "https://taskmanager-demo.netlify.app"
        }
      ],
      
      // Referencias
      referencias: [
        {
          id: "ref-1",
          nombre: "María Rodríguez",
          cargo: "Tech Lead",
          empresa: "TechCorp Solutions",
          telefono: "+34 611 234 567",
          email: "maria.rodriguez@techcorp.com"
        },
        {
          id: "ref-2",
          nombre: "Carlos Martín",
          cargo: "CTO",
          empresa: "Digital Agency Pro",
          telefono: "+34 622 345 678",
          email: "carlos.martin@digitalagency.com"
        }
      ]
    };
    
    setNewCv(prevCv => ({
      ...prevCv,
      ...testData
    }));
    
    showAlert.success("Datos de prueba cargados", "El formulario se ha llenado automáticamente con datos de ejemplo para pruebas.");
  }, []);

  // Función para limpiar el formulario
  const clearForm = useCallback(() => {
    setNewCv({
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
    
    showAlert.success("Formulario limpiado", "Todos los campos han sido limpiados.");
  }, []);

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
      let cvPdfUrl = "";
      
      // Si es un CV generado, crear el PDF y subirlo
      if (tabValue === 0) {
        console.log("🎨 Generando CV con plantilla:", selectedTemplate);
        
        // Validar datos antes de generar
        const validation = pdfGeneratorService.validateCVData(newCv);
        if (!validation.isValid) {
          const errorMessages = validation.errors.join(', ');
          showAlert.error("Error de validación", `Por favor corrige los siguientes errores: ${errorMessages}`);
          return;
        }
        
        // Generar PDF
        const pdfDoc = pdfGeneratorService.generateCVPdf(newCv, selectedTemplate);
        const pdfBlob = pdfGeneratorService.getPDFAsBlob(pdfDoc);
        
        // Crear archivo para subir
        const fileName = `CV_${newCv.Nombre}_${newCv.Apellido}_${selectedTemplate}.pdf`;
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        // Subir PDF usando el hook de subida de archivos
        console.log("📤 Subiendo PDF generado...");
        await new Promise((resolve, reject) => {
          handleFileChange(
            { target: { files: [pdfFile] } }, 
            "cv", 
            (url) => {
              cvPdfUrl = url;
              console.log("✅ PDF generado y subido:", url);
              resolve();
            }
          );
        });
      }
      
      // Preparar datos según el modo
      const finalCvUrl = tabValue === 0 ? cvPdfUrl : newCv.cv;
      
      console.log("📋 Datos del CV a guardar:", {
        modo: tabValue === 0 ? "Generado" : "Subido manualmente",
        cvUrl: finalCvUrl,
        plantilla: tabValue === 0 ? selectedTemplate : "N/A"
      });
      
      const cvData = {
        ...newCv,
        estado: "pendiente",
        uid: user.uid,
        cv: finalCvUrl, // Campo principal para compatibilidad con Dashboard
        cvGenerado: tabValue === 0, // true si es generador, false si es subida
        plantillaSeleccionada: tabValue === 0 ? selectedTemplate : null,
        cvPdfUrl: finalCvUrl, // URL del PDF (compatibilidad futura)
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
      await sendRegistrationEmails(cvData);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ flex: 1, textAlign: 'center' }}>
            {currentCv ? "Actualizar tu perfil y CV" : "Cargar perfil y tu CV"}
          </Typography>
          
          {/* Botones de utilidad para pruebas */}
          {!currentCv && (
            <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={fillWithTestData}
                sx={{ 
                  minWidth: 200,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🧪 Llenar con datos de prueba
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={clearForm}
                sx={{ 
                  minWidth: 120,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Limpiar
              </Button>
            </Box>
          )}
        </Box>

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'primary.main', textAlign: 'center', mr: 2 }}>
                Crea tu CV profesional paso a paso
              </Typography>
              {!currentCv && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={fillWithTestData}
                  sx={{ 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    px: 2,
                    py: 0.5
                  }}
                >
                  🧪 Datos de prueba
                </Button>
              )}
            </Box>
            
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

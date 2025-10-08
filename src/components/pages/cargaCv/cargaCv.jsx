import React, { useState, useEffect } from "react";
import { Button, TextField, Box, Select, MenuItem, Typography, FormControl, InputLabel, FormHelperText, Grid, Paper, Divider } from "@mui/material";
import { db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseAuthControlFile";
import { uploadFile, ensureAppFolder, createPublicShareLink } from "../../../lib/controlFileStorage";
import { addDoc, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners";
import emailjs from '@emailjs/browser';
import { CATEGORIAS_GENERALES, CATEGORIAS_ESPECIFICAS } from "../../../constants/categories";
import { PAISES, getEstadosPorPais } from "../../../constants/locations";

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

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isCvLoaded, setIsCvLoaded] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [autoFillApplied, setAutoFillApplied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCurrentCv(currentUser.uid);
        // Auto-completar datos del usuario de Google
        autoFillUserData(currentUser);
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
          // Cargar estados si hay un país seleccionado
          if (cvData.pais) {
            setEstadosDisponibles(getEstadosPorPais(cvData.pais));
          }
        });
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener el CV actual.", "error");
    }
  };

  // Nueva función para auto-completar datos del usuario
  const autoFillUserData = (currentUser) => {
    if (currentUser && !autoFillApplied && !currentCv) {
      const userData = {
        Email: currentUser.email || "",
        // Intentar extraer nombre y apellido del displayName
        ...(currentUser.displayName && {
          Nombre: currentUser.displayName.split(' ')[0] || "",
          Apellido: currentUser.displayName.split(' ').slice(1).join(' ') || ""
        }),
        // Podríamos agregar más datos si están disponibles
        // País podría detectarse por idioma o timezone
      };

      // Solo actualizar campos vacíos
      setNewCv(prevCv => ({
        ...prevCv,
        ...Object.fromEntries(
          Object.entries(userData).filter(([key, value]) => value && !prevCv[key])
        )
      }));
      
      setAutoFillApplied(true);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    if (type === "Foto") setLoadingImage(true);
    if (type === "cv") setLoadingCv(true);

    try {
      // 1. Crear/obtener carpeta principal "BolsaTrabajo" (con metadata.source: taskbar)
      console.log('📁 Obteniendo carpeta BolsaTrabajo...');
      const folderId = await ensureAppFolder();
      console.log('✅ Carpeta BolsaTrabajo ID:', folderId);
      
      // 2. Subir archivo directamente a la carpeta BolsaTrabajo
      console.log(`📤 Subiendo ${type} a BolsaTrabajo...`);
      let fileId = await uploadFile(file, folderId, (progress) => {
        console.log(`Progreso de ${type}: ${progress}%`);
      });
      
      console.log(`✅ ${type} subido con ID:`, fileId);
      
      // 3. Crear enlace público para que el admin pueda verlo
      console.log(`🔗 Creando enlace público para ${type} con fileId:`, fileId);
      try {
        const shareUrl = await createPublicShareLink(fileId, 8760); // 1 año
        console.log(`✅ Enlace público creado:`, shareUrl);
        
        // Guardar el enlace público en lugar del fileId
        setNewCv((prevCv) => ({ ...prevCv, [type]: shareUrl }));
      } catch (shareError) {
        console.error(`❌ Error creando share link para ${type}:`, shareError);
        // Si falla el share link, guardar el fileId directamente
        console.log(`⚠️ Guardando fileId directamente como fallback`);
        setNewCv((prevCv) => ({ ...prevCv, [type]: fileId }));
      }
      
      Swal.fire("Carga exitosa", `${type} cargado con éxito.`, "success");

      if (type === "Foto") {
        setIsImageLoaded(true);
        setLoadingImage(false);
      }
      if (type === "cv") {
        setIsCvLoaded(true);
        setLoadingCv(false);
      }
    } catch (error) {
      console.error(`Error al cargar ${type}:`, error);
      Swal.fire("Error", `Error al cargar ${type}. Inténtalo nuevamente.`, "error");
      if (type === "Foto") setLoadingImage(false);
      if (type === "cv") setLoadingCv(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    handleFileUpload(file, type);
  };

  const handleChange = (e) => {
    setNewCv({ ...newCv, [e.target.name]: e.target.value });
  };

  // Manejar cambio de país para actualizar estados disponibles
  const handlePaisChange = (e) => {
    const selectedPais = e.target.value;
    setNewCv({ ...newCv, pais: selectedPais, estadoProvincia: "", ciudad: "", localidad: "" });
    setEstadosDisponibles(getEstadosPorPais(selectedPais));
  };

  // Manejar cambio de estado/provincia
  const handleEstadoChange = (e) => {
    setNewCv({ ...newCv, estadoProvincia: e.target.value, ciudad: "", localidad: "" });
  };

  // Función para enviar correo electrónico al usuario
  const sendUserEmail = async (userEmail, userName) => {
    try {
      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        message: 'Su registro ha sido realizado con éxito. Su CV está en revisión y pronto estará disponible.',
        subject: 'Registro exitoso en Bolsa de Trabajo CCF',
      };

      // Obtener las variables de entorno
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_USER_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      // Verificar si las variables están definidas
      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          templateParams,
          publicKey
        );
      } else {
        console.log('Configuración de EmailJS no completada. Saltando envío de correo al usuario.');
      }

      console.log('Correo enviado al usuario exitosamente');
    } catch (error) {
      console.error('Error al enviar correo al usuario:', error);
    }
  };

  // Función para enviar correo electrónico al administrador
  const sendAdminEmail = async (userName, userProfession, userLocation) => {
    try {
      const templateParams = {
        to_email: 'ccariramallo@gmail.com',
        to_name: 'Administrador',
        message: `Hay un nuevo registro para aprobar:\n\nNombre: ${userName} ${newCv.Apellido}\nProfesión: ${userProfession}\nUbicación: ${userLocation}\nEmail: ${newCv.Email}`,
        subject: 'Nuevo registro en Bolsa de Trabajo CCF',
      };

      // Obtener las variables de entorno
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      // Verificar si las variables están definidas
      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          templateParams,
          publicKey
        );
      } else {
        console.log('Configuración de EmailJS no completada. Saltando envío de correo al administrador.');
      }

      console.log('Correo enviado al administrador exitosamente');
    } catch (error) {
      console.error('Error al enviar correo al administrador:', error);
    }
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

      try {
        // Verificar si EmailJS está configurado
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const userTemplateId = import.meta.env.VITE_EMAILJS_USER_TEMPLATE_ID;
        const adminTemplateId = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        
        // Comprobar si tenemos la configuración completa
        const emailConfigured = serviceId && 
                              userTemplateId && userTemplateId !== 'template_id_usuario' && 
                              adminTemplateId && adminTemplateId !== 'template_id_admin' && 
                              publicKey && publicKey !== 'public_key';
        
        if (emailConfigured) {
          // Enviar correo al usuario
          await sendUserEmail(newCv.Email, newCv.Nombre);
          
          // Enviar correo al administrador con la ubicación completa
          const ubicacionCompleta = `${newCv.ciudad}, ${newCv.estadoProvincia}, ${newCv.pais}`;
          await sendAdminEmail(newCv.Nombre, newCv.categoriaGeneral, ubicacionCompleta);
          
          console.log('Correos enviados exitosamente');
        } else {
          console.log('EmailJS no está completamente configurado. No se enviarán correos.');
          console.log('Para configurar EmailJS, completa los valores en el archivo .env');
        }
      } catch (emailError) {
        console.error("Error al enviar correos:", emailError);
        // Continuamos con el proceso aunque falle el envío de correos
      }
      // Para San Nicolás, por ahora solo enviamos al usuario
      // Cuando tengas el correo del administrador de San Nicolás, puedes agregar la lógica aquí

      await Swal.fire({
        title: "CV Enviado",
        text: "Su CV está en revisión. Pronto estará disponible.",
        icon: "info",
        confirmButtonText: "Aceptar"
      });

      navigate("/");
      if (setIsChange) setIsChange((prev) => !prev);
      if (handleClose) handleClose();
      if (updateDashboard) updateDashboard();
    } catch (error) {
      console.error("Error al procesar el CV:", error);
      Swal.fire("Error", "Hubo un problema al cargar el CV. Inténtalo nuevamente.", "error");
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
          {/* Datos Personales */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
            📋 Datos Personales
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                variant="outlined" 
                label="Nombre *" 
                name="Nombre" 
                value={newCv.Nombre} 
                onChange={handleChange} 
                required 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                variant="outlined" 
                label="Apellido *" 
                name="Apellido" 
                value={newCv.Apellido} 
                onChange={handleChange} 
                required 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                variant="outlined" 
                label="Edad *" 
                name="Edad" 
                value={newCv.Edad} 
                onChange={handleChange} 
                required 
                fullWidth 
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                type="email" 
                label="Correo Electrónico *" 
                name="Email" 
                value={newCv.Email} 
                onChange={handleChange} 
                required 
                fullWidth 
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Información Profesional */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
            💼 Información Profesional
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required>
                <InputLabel id="categoria-general-label">Categoría Profesional *</InputLabel>
                <Select
                  labelId="categoria-general-label"
                  name="categoriaGeneral"
                  value={newCv.categoriaGeneral || ""}
                  onChange={handleChange}
                  label="Categoría Profesional *"
                >
                  <MenuItem value="" disabled>Seleccione una categoría</MenuItem>
                  {CATEGORIAS_GENERALES.map((categoria, index) => (
                    <MenuItem key={index} value={categoria}>{categoria}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>Obligatorio</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <TextField 
                variant="outlined" 
                label="Profesión Específica (opcional)" 
                name="categoriaEspecifica" 
                value={newCv.categoriaEspecifica} 
                onChange={handleChange} 
                fullWidth 
                helperText="Ejemplo: Desarrollador Frontend, Cirujano, etc."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Ubicación */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
            📍 Ubicación
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required>
                <InputLabel id="pais-label">País *</InputLabel>
                <Select
                  labelId="pais-label"
                  name="pais"
                  value={newCv.pais || ""}
                  onChange={handlePaisChange}
                  label="País *"
                >
                  <MenuItem value="" disabled>Seleccione un país</MenuItem>
                  {PAISES.map((pais, index) => (
                    <MenuItem key={index} value={pais}>{pais}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              {newCv.pais && estadosDisponibles.length > 0 ? (
                <FormControl fullWidth required>
                  <InputLabel id="estado-label">Estado/Provincia *</InputLabel>
                  <Select
                    labelId="estado-label"
                    name="estadoProvincia"
                    value={newCv.estadoProvincia || ""}
                    onChange={handleEstadoChange}
                    label="Estado/Provincia *"
                  >
                    <MenuItem value="" disabled>Seleccione estado/provincia</MenuItem>
                    {estadosDisponibles.map((estadoItem, index) => (
                      <MenuItem key={index} value={estadoItem}>{estadoItem}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField 
                  variant="outlined" 
                  label="Estado/Provincia *" 
                  name="estadoProvincia" 
                  value={newCv.estadoProvincia} 
                  onChange={handleChange} 
                  required 
                  fullWidth 
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                variant="outlined" 
                label="Ciudad *" 
                name="ciudad" 
                value={newCv.ciudad} 
                onChange={handleChange} 
                required 
                fullWidth 
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                variant="outlined" 
                label="Localidad/Barrio (opcional)" 
                name="localidad" 
                value={newCv.localidad} 
                onChange={handleChange} 
                fullWidth 
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Archivos */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
            📎 Documentos
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <TextField 
                  type="file" 
                  onChange={(e) => handleFileChange(e, "Foto")} 
                  helperText="Cargar foto de perfil" 
                  required 
                  fullWidth 
                  inputProps={{ accept: "image/*" }}
                />
                {loadingImage && <RingLoader color="#36D7B7" size={40} />}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <TextField 
                  type="file" 
                  onChange={(e) => handleFileChange(e, "cv")} 
                  helperText="Cargar curriculum vitae" 
                  required 
                  fullWidth 
                  inputProps={{ accept: ".pdf,.doc,.docx" }}
                />
                {loadingCv && <RingLoader color="#36D7B7" size={40} />}
              </Box>
            </Grid>
          </Grid>
          
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

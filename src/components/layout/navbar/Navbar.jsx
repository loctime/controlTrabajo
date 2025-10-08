import React, { useContext, useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link, Outlet, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import GetAppIcon from "@mui/icons-material/GetApp";
import { AuthContext } from "../../../context/AuthContext";
import { logout } from "../../../firebaseAuthControlFile";
import { db } from "../../../firebaseConfig";
import { deleteFile } from "../../../lib/controlFileStorage";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import Swal from "sweetalert2";
import { menuItems } from "../../../router/navigation";
import { usePWAInstall } from "../../../hooks/usePWAInstall";

function Navbar() {
  const { logoutContext, user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const navigate = useNavigate();
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;
  const rolAdminEspecial = "eEI7F72asd";
  const isAdmin = user?.rol === rolAdmin || user?.rol === rolAdminEspecial;
  
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  // Función para agregar logs visuales
  const addDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
  };

  // Hook PWA
  const { isInstallable, isInstalled, installPWA } = usePWAInstall(addDebugLog);

  // Función de instalación con logs visuales
  const handleInstallPWA = async () => {
    addDebugLog("🚀 Iniciando instalación...");
    
    try {
      const result = await installPWA();
      if (result) {
        addDebugLog("✅ ¡Instalación exitosa!");
      } else {
        addDebugLog("❌ Instalación cancelada/fallida");
      }
    } catch (error) {
      addDebugLog(`❌ Error: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?.email) {
        try {
          const q = query(collection(db, "cv"), where("Email", "==", user.email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data?.Foto) {
              setProfilePhoto(data.Foto);
            }
          });
        } catch (error) {
          console.error("Error fetching profile photo:", error);
        }
      }
    };
    fetchProfilePhoto();
  }, [user]);

  // Agregar logs cuando cambie el estado PWA
  useEffect(() => {
    if (showDebug) {
      addDebugLog(`Estado PWA - Instalable: ${isInstallable}, Instalado: ${isInstalled}`);
    }
  }, [isInstallable, isInstalled, showDebug]);

  const handleLogout = () => {
    logout();
    logoutContext();
    navigate("/login");
  };

  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu perfil permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        // Mostrar loader mientras se elimina el perfil
        Swal.fire({
          title: 'Eliminando perfil...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Buscar el documento del usuario en Firestore
        const q = query(collection(db, "cv"), where("Email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        // Si no hay documentos para eliminar
        if (querySnapshot.empty) {
          Swal.fire('Error', 'No se encontró el perfil para eliminar.', 'error');
          return;
        }

        // Array para almacenar todas las promesas de eliminación
        const deletePromises = [];
        
        // Procesar cada documento encontrado
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // 1. Eliminar la foto de perfil de ControlFile Storage si existe
          if (data.Foto) {
            // Si es URL antigua de Firebase Storage
            if (data.Foto.startsWith('https://firebasestorage.googleapis.com')) {
              console.warn("Archivo antiguo de Firebase Storage, no se eliminará automáticamente:", data.Foto);
            } else {
              // Es un fileId de ControlFile
              deletePromises.push(deleteFile(data.Foto).catch(err => {
                console.error("Error al eliminar la foto de perfil:", err);
                // Continuar con el proceso aunque falle la eliminación de la foto
              }));
            }
          }
          
          // 2. Eliminar el archivo CV de ControlFile Storage si existe
          if (data.cv) {
            // Si es URL antigua de Firebase Storage
            if (data.cv.startsWith('https://firebasestorage.googleapis.com')) {
              console.warn("Archivo antiguo de Firebase Storage, no se eliminará automáticamente:", data.cv);
            } else {
              // Es un fileId de ControlFile
              deletePromises.push(deleteFile(data.cv).catch(err => {
                console.error("Error al eliminar el CV:", err);
                // Continuar con el proceso aunque falle la eliminación del CV
              }));
            }
          }
          
          // 3. Eliminar el documento de Firestore
          deletePromises.push(deleteDoc(doc(db, "cv", docSnap.id)));
        });

        // Esperar a que todas las operaciones de eliminación terminen
        await Promise.all(deletePromises);
        
        Swal.fire('Perfil eliminado', 'Tu perfil ha sido eliminado completamente.', 'success');
        handleLogout();
      } catch (error) {
        console.error("Error al eliminar el perfil:", error);
        Swal.fire('Error', 'No se pudo eliminar el perfil completamente.', 'error');
      }
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            {menuItems.map(({ id, path, title }) => (
              <Button key={id} color="inherit" component={Link} to={path} sx={{ textTransform: "none", fontSize: { xs: '1rem', md: '1.1rem' }, fontFamily: 'inherit', letterSpacing: 0 }} translate="no">
                {title}
              </Button>
            ))}
            {isAdmin && (
              <Button color="inherit" component={Link} to="/dashboard" sx={{ textTransform: "none", fontSize: { xs: '1rem', md: '1.1rem' }, fontFamily: 'inherit', letterSpacing: 0 }} translate="no">
                Dashboard
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Botón DEBUG PWA */}
            <IconButton
              onClick={() => setShowDebug(!showDebug)}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.25)"
                }
              }}
              title="PWA Debug Info"
            >
              🔍
            </IconButton>

            {/* Botón de instalación PWA redondo y moderno */}
            {!isInstalled && isInstallable && (
              <IconButton
                onClick={installPWA}
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                  },
                  "&:active": {
                    transform: "scale(0.95)"
                  },
                  transition: "all 0.2s ease"
                }}
                title="Instalar App"
              >
                <GetAppIcon sx={{ fontSize: 24 }} />
              </IconButton>
            )}
            
            <IconButton onClick={handleAvatarClick} color="inherit">
              {profilePhoto ? (
                <Avatar src={profilePhoto} alt="Usuario" />
              ) : (
                <Avatar alt="Usuario">
                  <AccountCircleIcon />
                </Avatar>
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  minWidth: 180,
                  fontFamily: 'inherit',
                  fontSize: { xs: '1rem', md: '1.05rem' },
                  letterSpacing: 0,
                },
              }}
              MenuListProps={{
                sx: {
                  padding: 0,
                },
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ fontFamily: 'inherit', fontSize: { xs: '1rem', md: '1.05rem' }, letterSpacing: 0 }}>
                <LogoutIcon sx={{ mr: 1 }} /> Cerrar sesión
              </MenuItem>
              <MenuItem onClick={handleDeleteProfile} sx={{ fontFamily: 'inherit', fontSize: { xs: '1rem', md: '1.05rem' }, letterSpacing: 0 }}>
                <LogoutIcon sx={{ mr: 1 }} /> Eliminar perfil
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Panel de Debug PWA */}
      {showDebug && (
        <Box
          sx={{
            position: "fixed",
            top: 70,
            right: 10,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            color: "white",
            padding: 2,
            borderRadius: 2,
            minWidth: 280,
            maxWidth: "90vw",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            fontSize: "12px",
            fontFamily: "monospace",
            maxHeight: "80vh",
            overflow: "auto"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, pb: 1, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            <strong style={{ fontSize: "14px" }}>🔍 PWA Debug</strong>
            <Button 
              onClick={() => setShowDebug(false)} 
              size="small"
              sx={{ color: "white", minWidth: 30, padding: 0 }}
            >
              ✕
            </Button>
          </Box>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box>
              <strong>Estado:</strong>
            </Box>
            <Box sx={{ pl: 1, color: isInstalled ? "#4caf50" : "#ff9800" }}>
              • Instalado: {isInstalled ? "✅ SÍ" : "❌ NO"}
            </Box>
            <Box sx={{ pl: 1, color: isInstallable ? "#4caf50" : "#f44336" }}>
              • Instalable: {isInstallable ? "✅ SÍ" : "❌ NO"}
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <strong>Navegador:</strong>
            </Box>
            <Box sx={{ pl: 1, fontSize: "11px", color: "#bbb" }}>
              {navigator.userAgent.substring(0, 80)}...
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <strong>Display Mode:</strong>
            </Box>
            <Box sx={{ pl: 1 }}>
              • Standalone: {window.matchMedia('(display-mode: standalone)').matches ? "✅" : "❌"}
            </Box>
            <Box sx={{ pl: 1 }}>
              • iOS Standalone: {window.navigator.standalone ? "✅" : "❌"}
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <strong>Service Worker:</strong>
            </Box>
            <Box sx={{ pl: 1 }}>
              • Registrado: {navigator.serviceWorker?.controller ? "✅" : "❌"}
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <strong>Manifest:</strong>
            </Box>
            <Box sx={{ pl: 1, fontSize: "11px", wordBreak: "break-all", color: "#bbb" }}>
              {document.querySelector('link[rel="manifest"]')?.href || "❌ No encontrado"}
            </Box>
            
            <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <Button
                onClick={handleInstallPWA}
                variant="contained"
                size="small"
                fullWidth
                sx={{ 
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" }
                }}
              >
                🚀 Intentar Instalar
              </Button>
            </Box>

            {/* Logs visuales */}
            {debugLogs.length > 0 && (
              <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                <strong style={{ fontSize: "11px" }}>📋 Logs:</strong>
                <Box sx={{ mt: 0.5, maxHeight: 100, overflow: "auto" }}>
                  {debugLogs.map((log, index) => (
                    <Box key={index} sx={{ fontSize: "10px", color: "#ccc", mb: 0.5 }}>
                      {log}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <Button
                onClick={() => {
                  addDebugLog("🔍 Verificando estado completo...");
                  addDebugLog(`URL actual: ${window.location.href}`);
                  addDebugLog(`HTTPS: ${location.protocol === 'https:' ? 'SÍ' : 'NO'}`);
                  addDebugLog(`Service Worker: ${navigator.serviceWorker ? 'Disponible' : 'NO disponible'}`);
                  addDebugLog(`beforeinstallprompt soportado: ${'onbeforeinstallprompt' in window ? 'SÍ' : 'NO'}`);
                  
                  // Verificar si ya está en pantalla de inicio
                  if (window.matchMedia('(display-mode: standalone)').matches) {
                    addDebugLog("⚠️ YA ESTÁ INSTALADO como PWA");
                  } else {
                    addDebugLog("✅ No está instalado como PWA");
                  }
                  
                  // Verificar si hay icono de instalación visible
                  addDebugLog("🔍 Busca el icono ⬇️ en la barra de direcciones");
                  addDebugLog("Si lo ves, Chrome detecta que es instalable");
                  
                  // Intentar detectar si el navegador muestra opciones de instalación
                  if (navigator.userAgent.includes('Chrome') && !window.matchMedia('(display-mode: standalone)').matches) {
                    addDebugLog("💡 SOLUCIÓN: Usa el menú del navegador");
                    addDebugLog("   ⋮ → Instalar app / Agregar a pantalla");
                  }
                }}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ 
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": { 
                    borderColor: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
              >
                🔍 Verificar Estado
              </Button>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Button
                onClick={() => {
                  addDebugLog("👆 Simulando interacción del usuario...");
                  
                  // Simular interacción del usuario (click)
                  const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  document.dispatchEvent(clickEvent);
                  
                  // También simular scroll
                  const scrollEvent = new Event('scroll', {
                    bubbles: true,
                    cancelable: true
                  });
                  document.dispatchEvent(scrollEvent);
                  
                  addDebugLog("✅ Interacciones simuladas");
                  addDebugLog("🔄 Espera 2 segundos y toca 'Intentar Instalar'");
                  
                  setTimeout(() => {
                    addDebugLog("⏰ Ahora puedes intentar instalar");
                  }, 2000);
                }}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ 
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": { 
                    borderColor: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
              >
                👆 Simular Interacción
              </Button>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Button
                onClick={() => {
                  addDebugLog("🔧 Instalación manual...");
                  
                  // Verificar si hay opciones de instalación en el navegador
                  addDebugLog("📱 Busca en tu navegador:");
                  addDebugLog("• Menú ⋮ (3 puntos) → Instalar app");
                  addDebugLog("• Icono ⬇️ en la barra de direcciones");
                  addDebugLog("• Menú → Agregar a pantalla de inicio");
                  
                  // Mostrar alerta con instrucciones
                  setTimeout(() => {
                    alert(`📱 INSTRUCCIONES DE INSTALACIÓN:

1. Toca el menú ⋮ (3 puntos) en Chrome
2. Busca "Instalar app" o "Agregar a pantalla de inicio"
3. Toca "Instalar" o "Agregar"

O busca el icono ⬇️ en la barra de direcciones.

¡La app se instalará automáticamente!`);
                  }, 500);
                }}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ 
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": { 
                    borderColor: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}
              >
                📱 Instalación Manual
              </Button>
            </Box>

            <Box sx={{ mt: 1, fontSize: "10px", color: "#888", fontStyle: "italic" }}>
              Abre la consola del navegador para ver logs detallados
            </Box>
          </Box>
        </Box>
      )}
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Navbar;
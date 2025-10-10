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
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { AuthContext } from "../../../context/AuthContext";
import { logout } from "../../../firebaseAuthControlFile";
import { db } from "../../../firebaseConfig";
import { deleteFile } from "../../../lib/controlFileStorage";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { showAlert } from "../../../utils/swalConfig";
import { menuItems } from "../../../router/navigation";

function Navbar() {
  const { logoutContext, user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const navigate = useNavigate();
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;
  const rolAdminEspecial = "eEI7F72asd";
  const isAdmin = user?.rol === rolAdmin || user?.rol === rolAdminEspecial;

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

  const handleLogout = () => {
    logout();
    logoutContext();
    navigate("/login");
  };

  const handleDeleteProfile = async () => {
    const result = await showAlert.confirm(
      '¿Estás seguro?',
      'Esta acción eliminará tu perfil permanentemente.'
    );

    if (result.isConfirmed) {
      try {
        // Mostrar loader mientras se elimina el perfil
        showAlert.loading('Eliminando perfil...', 'Por favor espera');

        // Buscar el documento del usuario en Firestore
        const q = query(collection(db, "cv"), where("Email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        // Si no hay documentos para eliminar
        if (querySnapshot.empty) {
          showAlert.error('Error', 'No se encontró el perfil para eliminar.');
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
        
        showAlert.success('Perfil eliminado', 'Tu perfil ha sido eliminado completamente.');
        handleLogout();
      } catch (error) {
        console.error("Error al eliminar el perfil:", error);
        showAlert.error('Error', 'No se pudo eliminar el perfil completamente.');
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
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' }, px: { xs: 1, sm: 2 } }}>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: { xs: 0, sm: 1 } }}>
            {menuItems.map(({ id, path, title, Icon }) => {
              // Versión móvil compacta
              if (id === "home") {
                return (
                  <Button 
                    key={id} 
                    color="inherit" 
                    component={Link} 
                    to={path} 
                    sx={{ 
                      textTransform: "none", 
                      fontSize: { xs: '1.2rem', md: '1.1rem' }, 
                      fontFamily: 'inherit', 
                      letterSpacing: 0,
                      flex: { xs: 1, md: 'none' },
                      minHeight: { xs: '48px', md: 'auto' },
                      px: { xs: 1, md: 2 }
                    }} 
                    translate="no"
                  >
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Icon sx={{ fontSize: { xs: '1.5rem', md: 'inherit' } }} />
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      {title}
                    </Box>
                  </Button>
                );
              }
              
              if (id === "cv") {
                return (
                  <Button 
                    key={id} 
                    color="inherit" 
                    component={Link} 
                    to={path} 
                    sx={{ 
                      textTransform: "none", 
                      fontSize: { xs: '0.9rem', md: '1.1rem' }, 
                      fontFamily: 'inherit', 
                      letterSpacing: 0,
                      flex: { xs: 1, md: 'none' },
                      minHeight: { xs: '48px', md: 'auto' },
                      px: { xs: 1, md: 2 }
                    }} 
                    translate="no"
                  >
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      Ver CV
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      {title}
                    </Box>
                  </Button>
                );
              }
              
              if (id === "mi-cv") {
                return (
                  <Button 
                    key={id} 
                    color="inherit" 
                    component={Link} 
                    to={path} 
                    sx={{ 
                      textTransform: "none", 
                      fontSize: { xs: '0.9rem', md: '1.1rem' }, 
                      fontFamily: 'inherit', 
                      letterSpacing: 0,
                      flex: { xs: 1, md: 'none' },
                      minHeight: { xs: '48px', md: 'auto' },
                      px: { xs: 1, md: 2 }
                    }} 
                    translate="no"
                  >
                    {title}
                  </Button>
                );
              }
              
              if (id === "Cargar Cv") {
                return (
                  <Button 
                    key={id} 
                    color="inherit" 
                    component={Link} 
                    to={path} 
                    sx={{ 
                      textTransform: "none", 
                      fontSize: { xs: '0.9rem', md: '1.1rem' }, 
                      fontFamily: 'inherit', 
                      letterSpacing: 0,
                      flex: { xs: 1, md: 'none' },
                      minHeight: { xs: '48px', md: 'auto' },
                      px: { xs: 1, md: 2 },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }} 
                    translate="no"
                  >
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
                      <FileUploadIcon sx={{ fontSize: { xs: '1.2rem', md: 'inherit' } }} />
                      CV
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      {title}
                    </Box>
                  </Button>
                );
              }
              
              return (
                <Button 
                  key={id} 
                  color="inherit" 
                  component={Link} 
                  to={path} 
                  sx={{ 
                    textTransform: "none", 
                    fontSize: { xs: '0.9rem', md: '1.1rem' }, 
                    fontFamily: 'inherit', 
                    letterSpacing: 0,
                    flex: { xs: 1, md: 'none' },
                    minHeight: { xs: '48px', md: 'auto' },
                    px: { xs: 1, md: 2 }
                  }} 
                  translate="no"
                >
                  {title}
                </Button>
              );
            })}
            {isAdmin && (
              <Button color="inherit" component={Link} to="/dashboard" sx={{ textTransform: "none", fontSize: { xs: '0.9rem', md: '1.1rem' }, fontFamily: 'inherit', letterSpacing: 0, flex: { xs: 1, md: 'none' }, minHeight: { xs: '48px', md: 'auto' }, px: { xs: 1, md: 2 } }} translate="no">
                Dashboard
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 2 } }}>
            <IconButton onClick={handleAvatarClick} color="inherit" sx={{ p: { xs: 0.5, md: 1 } }}>
              {profilePhoto ? (
                <Avatar src={profilePhoto} alt="Usuario" sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }} />
              ) : (
                <Avatar alt="Usuario" sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
                  <AccountCircleIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
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
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Navbar;
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
import { AuthContext } from "../../../context/AuthContext";
import { logout } from "../../../firebaseConfig";
import { db, storage } from "../../../firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Swal from "sweetalert2";
import { menuItems } from "../../../router/navigation";

function Navbar() {
  const { logoutContext, user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const navigate = useNavigate();
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;

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
          
          // 1. Eliminar la foto de perfil del storage si existe
          if (data.Foto && data.Foto.startsWith('https://firebasestorage.googleapis.com')) {
            try {
              // Obtener la referencia del storage desde la URL
              const photoRef = ref(storage, data.Foto);
              deletePromises.push(deleteObject(photoRef).catch(err => {
                console.error("Error al eliminar la foto de perfil:", err);
                // Continuar con el proceso aunque falle la eliminación de la foto
              }));
            } catch (error) {
              console.error("Error al obtener referencia de la foto:", error);
            }
          }
          
          // 2. Eliminar el archivo CV del storage si existe
          if (data.cv && data.cv.startsWith('https://firebasestorage.googleapis.com')) {
            try {
              const cvRef = ref(storage, data.cv);
              deletePromises.push(deleteObject(cvRef).catch(err => {
                console.error("Error al eliminar el CV:", err);
                // Continuar con el proceso aunque falle la eliminación del CV
              }));
            } catch (error) {
              console.error("Error al obtener referencia del CV:", error);
            }
          }
          
          // 3. Eliminar cualquier otro archivo asociado al usuario
          // Si tienes otros archivos almacenados, agrégalos aquí siguiendo el mismo patrón
          
          // 4. Eliminar el documento de Firestore
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
            {user.rol === rolAdmin && (
              <Button color="inherit" component={Link} to="/dashboard" sx={{ textTransform: "none", fontSize: { xs: '1rem', md: '1.1rem' }, fontFamily: 'inherit', letterSpacing: 0 }} translate="no">
                Dashboard
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Navbar;
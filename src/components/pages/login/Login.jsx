import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { db } from "../../../firebaseConfig";
import { loginGoogle, onSigIn } from "../../../firebaseAuthControlFile";
import { collection, doc, getDoc } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { RingLoader } from "react-spinners"; // Importa RingLoader desde react-spinners
import placargistro from "../../assets/placargistro.jpeg";
import conectadoImage from "../../assets/conectado.jpeg";

const Login = () => {
  const { handleLogin } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar la carga
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const validationSchema = Yup.object({
    email: Yup.string().email('Email no válido').required('Email es requerido'),
    password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña es requerida'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true); // Activar el loader al enviar el formulario
      try {
        const res = await onSigIn(values);
        if (res?.user) {
          const userCollection = collection(db, "users");
          const userRef = doc(userCollection, res.user.uid);
          const userDoc = await getDoc(userRef);
          
          // Combinar información de Firebase Auth con Firestore
          let finalyUser = {
            email: res.user.email,
            uid: res.user.uid,
            displayName: res.user.displayName,
            photoURL: res.user.photoURL,
            rol: userDoc.data()?.rol || "user", // Rol desde Firestore
          };
          
          handleLogin(finalyUser);
          navigate("/");
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Usted no está registrado!, Verifique su contraseña su mail, o regístrese',
          });
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Usted no está registrado!, Verifique su contraseña su mail, o regístrese',
        });
      } finally {
        setLoading(false); // Desactivar el loader después de completar la autenticación
      }
    },
  });

  const googleSingIn = async () => {
    setLoading(true); // Activar el loader al iniciar sesión con Google
    try {
      let res = await loginGoogle();
      
      // Obtener el rol desde Firestore si existe
      const userCollection = collection(db, "users");
      const userRef = doc(userCollection, res.user.uid);
      const userDoc = await getDoc(userRef);
      
      let finalyUser = {
        email: res.user.email,
        uid: res.user.uid,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        rol: userDoc.exists() ? userDoc.data().rol : "user"
      };
      
      handleLogin(finalyUser);
      navigate("/");
    } catch (error) {
      console.log(error);
      alert('Error al iniciar sesión con Google. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false); // Desactivar el loader después de intentar iniciar sesión con Google
    }
  };

  return (
    <Box
      className="home-container"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        backgroundColor: "#f3f3f3", // Color de fondo similar al de LinkedIn
      }}
    >
      {/* Imagen superior */}
      <Box
        sx={{
          width: "100%",
          height: "auto",
        }}
      >
        <img src={conectadoImage} alt="Conectado" style={{ width: "93%", height: "auto" }} />
      </Box>

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          position: "relative",
          padding: "20px", // Espaciado interior para el formulario
        }}
      >
        {/* Imagen de fondo */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" }, // Ajuste del tamaño en función del tamaño de pantalla
            height: { xs: "200px", md: "750px" }, // Ajuste de altura en pantallas pequeñas
            backgroundImage: `url(${placargistro})`,
            backgroundSize: "contain", // Ajuste para que la imagen se adapte sin recortar
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat", // Evita que la imagen se repita
            mb: { xs: 3, md: 0 }, // Margen inferior en pantallas pequeñas
          }}
        />

        {/* Formulario */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" }, // Ajuste del tamaño en función del tamaño de pantalla
            padding: "20px", // Espaciado interior para el formulario
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Loader mientras se procesa */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
              <RingLoader color="#66bb6a" loading={loading} size={50} /> {/* RingLoader */}
            </Box>
          )}

          <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            <Grid container rowSpacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email"
                  fullWidth
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl variant="outlined" fullWidth error={formik.touched.password && Boolean(formik.errors.password)}>
                  <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                  <OutlinedInput
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff color="primary" /> : <Visibility color="primary" />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Contraseña"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <Typography variant="caption" color="error">{formik.errors.password}</Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Link to="/forgot-password" style={{ color: "#007bff", marginTop: "10px" }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </Grid>
              <Grid item xs={12} mt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  sx={{
                    color: "white",
                    textTransform: "none",
                    textShadow: "2px 2px 2px grey",
                    backgroundColor: "#66bb6a", // Cambio de color a verde claro
                  }}
                >
                  Ingresar
                </Button>
              </Grid>
              <Grid item xs={12} mt={1}>
                <Tooltip title="Ingresa con Google">
                  <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={googleSingIn}
                    type="button"
                    fullWidth
                    sx={{
                      color: "white",
                      textTransform: "none",
                      textShadow: "2px 2px 2px grey",
                      backgroundColor: "#66bb6a", // Cambio de color a verde claro
                    }}
                  >
                    Ingresa con Google
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={12} mt={1}>
                <Typography color={"secondary.primary"} variant={"h6"} align="center">
                  ¿Aún no tienes cuenta?
                </Typography>
              </Grid>
              <Grid item xs={12} mt={1}>
                <Tooltip title="Regístrate">
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/register")}
                    type="button"
                    sx={{
                      color: "white",
                      textTransform: "none",
                      textShadow: "2px 2px 2px grey",
                      backgroundColor: "#66bb6a", // Cambio de color a verde claro
                    }}
                  >
                    Regístrate
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;

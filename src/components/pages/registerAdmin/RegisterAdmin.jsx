import React, { useState } from 'react';
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebaseConfig";
import { signUp } from "../../../firebaseAuthControlFile";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { RingLoader } from "react-spinners";

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Correo electrónico inválido').required('El correo electrónico es obligatorio'),
      password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir').required('Confirme la contraseña'),
      nombre: Yup.string().min(2, 'Ingrese su nombre').required('El nombre es obligatorio'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Verificar si el usuario ya está registrado
        const docSnap = await getDoc(doc(db, "users", values.email));
        if (docSnap.exists()) {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: '¡Este correo ya está registrado!',
          });
          setIsButtonVisible(true);
          return;
        }
        
        // Registrar el usuario como administrador
        let res = await signUp(values);
        if (res.user.uid) {
          await setDoc(doc(db, "users", res.user.uid), { 
            rol: "eEI7F72asd",
            nombre: values.nombre,
            email: values.email
          });
        }
        
        Swal.fire({
          icon: 'success',
          title: '¡Administrador registrado exitosamente!',
          text: 'El usuario ha sido creado con permisos de administrador.',
          timer: 3500,
          timerProgressBar: true,
        }).then(() => {
          navigate("/login");
        });
      } catch (error) {
        // Manejar específicamente el caso de correo electrónico en uso
        if (error.code === 'auth/email-already-in-use') {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: '¡No se pudo registrar, el correo ya está en uso. Intenta con otro correo!',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: '¡Ha ocurrido un error al registrar el administrador!',
          });
          console.error(error);
        }
      } finally {
        setLoading(false);
        setIsButtonVisible(true);
      }
    }
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setIsButtonVisible(false);
    formik.handleSubmit();
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: 4,
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          maxWidth: 500,
          width: "90%",
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            color: "#667eea"
          }}
        >
          Registro de Administrador
        </Typography>
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ mb: 3, color: "text.secondary" }}
        >
          🔐 Acceso especial - Solo para administradores
        </Typography>
        
        <form onSubmit={handleFormSubmit}>
          <Grid
            container
            rowSpacing={2}
            justifyContent={"center"}
          >
            <Grid item xs={12}>
              <TextField
                name="nombre"
                label="Nombre"
                fullWidth
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nombre}
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                helperText={formik.touched.nombre && formik.errors.nombre}
              />
            </Grid>
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
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff color="primary" />
                        ) : (
                          <Visibility color="primary" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Contraseña"
                />
                {formik.touched.password && formik.errors.password && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {formik.errors.password}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-confirmPassword">
                  Confirmar contraseña
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff color="primary" />
                        ) : (
                          <Visibility color="primary" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirmar contraseña"
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {formik.errors.confirmPassword}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid container justifyContent="center" spacing={2} mt={1}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    height: '56px'
                  }}
                >
                  {loading && <RingLoader color="#667eea" size={50} />}
                  {!loading && isButtonVisible && (
                    <Button
                      variant="contained"
                      fullWidth
                      type="submit"
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: 600,
                        '&:hover': {
                          background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                        }
                      }}
                    >
                      Registrar Administrador
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/login")}
                  sx={{
                    borderColor: "#667eea",
                    color: "#667eea",
                    '&:hover': {
                      borderColor: "#5568d3",
                      backgroundColor: "rgba(102, 126, 234, 0.04)",
                    }
                  }}
                >
                  Regresar al Login
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterAdmin;


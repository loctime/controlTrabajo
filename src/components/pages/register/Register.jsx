import React, { useState } from 'react';
import { Box, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebaseConfig";
import { signUp } from "../../../firebaseAuthControlFile";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showAlert } from "../../../utils/swalConfig";
import { Button } from "../../common/Button";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
      setLoading(true); // Activar el loader al enviar el formulario
      try {
        // Verificar si el usuario ya está registrado
        const docSnap = await getDoc(doc(db, "users", values.email));
        if (docSnap.exists()) {
          showAlert.error('¡Error!', '¡Usted ya está registrado!');
          return;
        }
        // Si el usuario no está registrado, proceder con el registro
        let res = await signUp(values);
        if (res.user.uid) {
          await setDoc(doc(db, "users", res.user.uid), { rol: "user" });
        }
        // Llamar función backend para enviar correos
        try {
          const response = await fetch('https://bolsatrabajoccf.onrender.com/sendRegistrationEmails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: values.email,
              nombre: values.nombre
            })
          });
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || 'Error enviando correo');
          }
        } catch (err) {
          showAlert.warning(
            'Registro exitoso, pero hubo un problema al enviar el correo',
            'Verifica tu correo o contacta al administrador.'
          );
        }
        showAlert.success(
          '¡Registro exitoso!',
          'Se ha enviado un correo a su casilla. Por favor, verifique su bandeja de entrada y/o spam.',
          { timer: 3500, timerProgressBar: true }
        ).then(() => {
          navigate("/login");
        });
      } catch (error) {
        // Manejar específicamente el caso de correo electrónico en uso
        if (error.code === 'auth/email-already-in-use') {
          showAlert.error(
            '¡Error!',
            '¡No pudiste registrarte, el correo ya está en uso. Intenta con otro correo o inicia sesión!'
          );
        } else {
          // Mostrar error general si hay otros errores
          showAlert.error('¡Error!', '¡Ha ocurrido un error al registrar!');
          console.error(error);
        }
      } finally {
        setLoading(false); // Desactivar el loader después de completar el registro, incluso si hay errores
      }
    }
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
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
      }}
    >
      <form onSubmit={handleFormSubmit}>
        <Grid
          container
          rowSpacing={2}
          justifyContent={"center"}
        >
          <Grid item xs={10} md={12}>
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
          <Grid item xs={10} md={12}>
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
          <Grid item xs={10} md={12}>
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
              {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}
            </FormControl>
          </Grid>
          <Grid item xs={10} md={12}>
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
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <p>{formik.errors.confirmPassword}</p>}
            </FormControl>
          </Grid>
          <Grid container justifyContent="center" spacing={3} mt={2}>
            <Grid item xs={10} md={7}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                loading={loading}
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </Button>
            </Grid>
            <Grid item xs={10} md={7}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Regresar
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Register;

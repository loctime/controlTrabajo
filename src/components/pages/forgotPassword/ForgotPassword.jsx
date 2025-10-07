import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../firebaseConfig";
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Te enviamos un mail, controla tu casilla de correo no deseado. En caso de que no te haya llegado ningún mail, por favor contáctate con nosotros a este mail ccariramallo@gmail.com'
      });
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema enviando el correo. Por favor intenta nuevamente.'
      });
    }
  };

  return (
    <div>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        <Typography variant="h5" color={"primary"}>
          ¿Olvidaste tu contraseña?
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid
            container
            rowSpacing={2}
            justifyContent={"center"}
          >
            <Grid item xs={10} md={12}>
              <TextField
                type="text"
                variant="outlined"
                label="Email"
                fullWidth
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={10} md={12}>
              <Button type="submit" variant="contained" fullWidth>
                Recuperar
              </Button>
            </Grid>
            <Grid item xs={10} md={12}>
              <Button
                type="button"
                variant="contained"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Regresar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};

export default ForgotPassword;

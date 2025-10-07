import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Alert,
  CircularProgress,
  Grid,
  Divider
} from "@mui/material";
import { 
  CheckCircle, 
  HourglassEmpty, 
  Cancel,
  Edit,
  CloudUpload
} from "@mui/icons-material";
import { db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseAuthControlFile";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CvStatus = () => {
  const [user, setUser] = useState(null);
  const [cvData, setcvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserCV(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserCV = async (uid) => {
    try {
      setLoading(true);
      const cvCollection = collection(db, "cv");
      const q = query(cvCollection, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const cvDoc = querySnapshot.docs[0];
        setcvData({ id: cvDoc.id, ...cvDoc.data() });
      } else {
        setcvData(null);
      }
    } catch (error) {
      console.error("Error al obtener CV:", error);
      Swal.fire("Error", "No se pudo cargar la información del CV", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCV = () => {
    navigate("/cvc");
  };

  const handleUploadNewCV = () => {
    navigate("/cvc");
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "aprobado":
        return <CheckCircle sx={{ fontSize: 60, color: "success.main" }} />;
      case "pendiente":
        return <HourglassEmpty sx={{ fontSize: 60, color: "warning.main" }} />;
      case "no aprobado":
        return <Cancel sx={{ fontSize: 60, color: "error.main" }} />;
      default:
        return null;
    }
  };

  const getStatusChip = (estado) => {
    switch (estado) {
      case "aprobado":
        return <Chip label="Aprobado" color="success" />;
      case "pendiente":
        return <Chip label="Pendiente de revisión" color="warning" />;
      case "no aprobado":
        return <Chip label="No aprobado" color="error" />;
      default:
        return null;
    }
  };

  const formatFecha = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 800, margin: "40px auto", padding: 3 }}>
        <Alert severity="warning">
          Debes iniciar sesión para ver el estado de tu CV.
        </Alert>
      </Box>
    );
  }

  if (!cvData) {
    return (
      <Box sx={{ maxWidth: 800, margin: "40px auto", padding: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CloudUpload sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Aún no has cargado tu CV
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Carga tu CV para que las empresas puedan encontrarte
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleUploadNewCV}
              startIcon={<CloudUpload />}
            >
              Cargar mi CV
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Estado de tu CV
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box sx={{ mr: 3 }}>
              {getStatusIcon(cvData.estado)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom>
                {cvData.Nombre} {cvData.Apellido}
              </Typography>
              {getStatusChip(cvData.estado)}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Categoría Profesional
              </Typography>
              <Typography variant="body1" gutterBottom>
                {cvData.categoriaGeneral || cvData.Profesion || "No especificado"}
              </Typography>
            </Grid>

            {cvData.categoriaEspecifica && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Especialidad
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {cvData.categoriaEspecifica}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Ubicación
              </Typography>
              <Typography variant="body1" gutterBottom>
                {cvData.ciudad && cvData.estadoProvincia && cvData.pais
                  ? `${cvData.ciudad}, ${cvData.estadoProvincia}, ${cvData.pais}`
                  : cvData.Ciudad || "No especificada"}
                {cvData.localidad && ` (${cvData.localidad})`}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" gutterBottom>
                {cvData.Email}
              </Typography>
            </Grid>

            {cvData.versionCV && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Versión del CV
                </Typography>
                <Typography variant="body1" gutterBottom>
                  v{cvData.versionCV}
                </Typography>
              </Grid>
            )}
          </Grid>

          {cvData.estado === "pendiente" && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Tu CV está en proceso de revisión. Te notificaremos cuando sea aprobado.
              </Typography>
            </Alert>
          )}

          {cvData.estado === "aprobado" && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                ¡Felicidades! Tu CV ha sido aprobado y está visible para los empleadores.
              </Typography>
            </Alert>
          )}

          {cvData.estado === "no aprobado" && (
            <Alert severity="error" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tu CV no fue aprobado
              </Typography>
              {cvData.motivoRechazo && (
                <>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Motivo:</strong> {cvData.motivoRechazo}
                  </Typography>
                </>
              )}
              {cvData.fechaRechazo && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Fecha de rechazo: {formatFecha(cvData.fechaRechazo)}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 2 }}>
                Puedes editar tu CV y volver a enviarlo para revisión.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        {cvData.estado === "no aprobado" && (
          <>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleEditCV}
              startIcon={<Edit />}
            >
              Editar y reenviar CV
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleUploadNewCV}
              startIcon={<CloudUpload />}
            >
              Subir nuevo CV
            </Button>
          </>
        )}

        {cvData.estado === "aprobado" && (
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleEditCV}
            startIcon={<Edit />}
          >
            Actualizar mi CV
          </Button>
        )}

        {cvData.estado === "pendiente" && (
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleEditCV}
            startIcon={<Edit />}
          >
            Editar CV
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CvStatus;


import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { getDocs, collection } from "firebase/firestore";
import { Button, Select, MenuItem, Box, Grid, Container, Typography, Avatar, Paper, FormControl, InputLabel, TextField, Chip } from "@mui/material";
import { CATEGORIAS_GENERALES } from "../../../constants/categories";
import { PAISES, getEstadosPorPais } from "../../../constants/locations";

const ItemListContainer = () => {
  const [cvs, setCvs] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedPais, setSelectedPais] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [searchCiudad, setSearchCiudad] = useState("");
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cv"));
        const cvsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCvs(cvsData);

        // Obtener lista única de países
        const uniquePaises = [...new Set(cvsData
          .filter(cv => cv.pais)
          .map(cv => cv.pais)
        )];
        setPaises(uniquePaises);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchData();
  }, []);

  // Actualizar estados disponibles cuando se selecciona un país
  useEffect(() => {
    if (selectedPais) {
      const estadosDisponibles = getEstadosPorPais(selectedPais);
      if (estadosDisponibles.length > 0) {
        setEstados(estadosDisponibles);
      } else {
        // Si no hay estados predefinidos, obtener de los CVs
        const uniqueEstados = [...new Set(cvs
          .filter(cv => cv.pais === selectedPais && cv.estadoProvincia)
          .map(cv => cv.estadoProvincia)
        )];
        setEstados(uniqueEstados);
      }
    } else {
      setEstados([]);
    }
    setSelectedEstado("");
  }, [selectedPais, cvs]);

  // Función para descargar el PDF
  const handleDownloadPDF = (url) => {
    window.open(url, "_blank");
  };

  // Función para filtrar por categoría
  const handleCategoriaChange = (event) => {
    setSelectedCategoria(event.target.value);
  };

  // Función para filtrar por país
  const handlePaisChange = (event) => {
    setSelectedPais(event.target.value);
    setSelectedEstado("");
    setSearchCiudad("");
  };

  // Función para filtrar por estado
  const handleEstadoChange = (event) => {
    setSelectedEstado(event.target.value);
    setSearchCiudad("");
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSelectedCategoria("");
    setSelectedPais("");
    setSelectedEstado("");
    setSearchCiudad("");
  };

  // Filtrar CVs
  const filteredCVs = cvs.filter(cv => {
    // Filtro de estado (solo aprobados)
    if (cv.estado === "pendiente" || cv.estado === "no aprobado") {
      return false;
    }

    // Filtro por categoría (soporta tanto el nuevo campo como el antiguo)
    if (selectedCategoria && 
        cv.categoriaGeneral !== selectedCategoria && 
        cv.Profesion !== selectedCategoria) {
      return false;
    }

    // Filtro por país
    if (selectedPais && cv.pais !== selectedPais) {
      return false;
    }

    // Filtro por estado/provincia
    if (selectedEstado && cv.estadoProvincia !== selectedEstado) {
      return false;
    }

    // Filtro por ciudad (búsqueda parcial, case insensitive)
    if (searchCiudad && 
        !cv.ciudad?.toLowerCase().includes(searchCiudad.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <Container>
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontFamily: 'Arimo', fontWeight: 'bold' }}>
        Conecta con perfiles laborales
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Typography variant="h6" sx={{ fontFamily: 'Cy Grotesk Key', mb: 1 }}>
              Filtros de búsqueda
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Categoría Profesional</InputLabel>
              <Select
                value={selectedCategoria}
                onChange={handleCategoriaChange}
                label="Categoría Profesional"
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {CATEGORIAS_GENERALES.map((categoria, index) => (
                  <MenuItem key={index} value={categoria}>{categoria}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>País</InputLabel>
              <Select
                value={selectedPais}
                onChange={handlePaisChange}
                label="País"
              >
                <MenuItem value="">Todos los países</MenuItem>
                {PAISES.map((pais, index) => (
                  <MenuItem key={index} value={pais}>{pais}</MenuItem>
                ))}
                {paises.filter(p => !PAISES.includes(p)).map((pais, index) => (
                  <MenuItem key={`extra-${index}`} value={pais}>{pais}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedPais}>
              <InputLabel>Estado/Provincia</InputLabel>
              <Select
                value={selectedEstado}
                onChange={handleEstadoChange}
                label="Estado/Provincia"
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {estados.map((estado, index) => (
                  <MenuItem key={index} value={estado}>{estado}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Buscar ciudad"
              value={searchCiudad}
              onChange={(e) => setSearchCiudad(e.target.value)}
              placeholder="Ej: Buenos Aires"
              variant="outlined"
              fullWidth
            />

            <Button 
              variant="outlined" 
              onClick={handleClearFilters}
              fullWidth
            >
              Limpiar filtros
            </Button>

            {(selectedCategoria || selectedPais || selectedEstado || searchCiudad) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Filtros activos:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {selectedCategoria && (
                    <Chip label={selectedCategoria} size="small" onDelete={() => setSelectedCategoria("")} />
                  )}
                  {selectedPais && (
                    <Chip label={selectedPais} size="small" onDelete={() => setSelectedPais("")} />
                  )}
                  {selectedEstado && (
                    <Chip label={selectedEstado} size="small" onDelete={() => setSelectedEstado("")} />
                  )}
                  {searchCiudad && (
                    <Chip label={`Ciudad: ${searchCiudad}`} size="small" onDelete={() => setSearchCiudad("")} />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {filteredCVs.length} {filteredCVs.length === 1 ? 'perfil encontrado' : 'perfiles encontrados'}
          </Typography>
          <Grid container spacing={4}>
            {filteredCVs.map((cv) => (
              <Grid item xs={12} sm={6} md={4} key={cv.id}>
                <Paper sx={{ padding: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      alt={`${cv.Nombre} ${cv.Apellido}`}
                      src={cv.Foto}
                      sx={{ width: 80, height: 80, objectFit: 'cover', mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontFamily: 'Arimo', fontWeight: 'bold' }}>
                        {cv.Nombre} {cv.Apellido}
                      </Typography>
                      {cv.Edad && (
                        <Typography variant="body2" color="text.secondary">
                          {cv.Edad} años
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Categoría:</strong> {cv.categoriaGeneral || cv.Profesion || 'No especificada'}
                    </Typography>
                    {cv.categoriaEspecifica && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Especialidad:</strong> {cv.categoriaEspecifica}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Ubicación:</strong>{' '}
                      {cv.ciudad && cv.estadoProvincia && cv.pais
                        ? `${cv.ciudad}, ${cv.estadoProvincia}, ${cv.pais}`
                        : cv.Ciudad || 'No especificada'}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDownloadPDF(cv.cv)}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Ver CV
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {filteredCVs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron perfiles con los filtros seleccionados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Intenta ajustar los filtros de búsqueda
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ItemListContainer;

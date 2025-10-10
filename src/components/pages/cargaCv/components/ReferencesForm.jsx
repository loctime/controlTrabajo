import React from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Card,
  CardContent
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

export const ReferencesForm = ({ newCv, handleChange }) => {
  const referencias = newCv.referencias || [];

  const addReferencia = () => {
    const nuevaReferencia = {
      id: uuidv4(),
      nombre: "",
      cargo: "",
      empresa: "",
      telefono: "",
      email: ""
    };
    
    handleChange({
      target: {
        name: 'referencias',
        value: [...referencias, nuevaReferencia]
      }
    });
  };

  const removeReferencia = (id) => {
    const nuevasReferencias = referencias.filter(ref => ref.id !== id);
    handleChange({
      target: {
        name: 'referencias',
        value: nuevasReferencias
      }
    });
  };

  const updateReferencia = (id, field, value) => {
    const nuevasReferencias = referencias.map(ref => 
      ref.id === id ? { ...ref, [field]: value } : ref
    );
    handleChange({
      target: {
        name: 'referencias',
        value: nuevasReferencias
      }
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          👥 Referencias Laborales
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Add />} 
          onClick={addReferencia}
          size="small"
        >
          Agregar Referencia
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Incluye referencias de personas que puedan hablar sobre tu trabajo y competencias profesionales.
      </Typography>

      {referencias.map((referencia, index) => (
        <Card key={referencia.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Referencia {index + 1}
              </Typography>
              <IconButton 
                onClick={() => removeReferencia(referencia.id)}
                color="error"
                size="small"
              >
                <Delete />
              </IconButton>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Nombre completo" 
                  value={referencia.nombre} 
                  onChange={(e) => updateReferencia(referencia.id, 'nombre', e.target.value)}
                  fullWidth 
                  placeholder="Ej: María González López"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Cargo/Posición" 
                  value={referencia.cargo} 
                  onChange={(e) => updateReferencia(referencia.id, 'cargo', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Gerente de Proyectos"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Empresa" 
                  value={referencia.empresa} 
                  onChange={(e) => updateReferencia(referencia.id, 'empresa', e.target.value)}
                  fullWidth 
                  placeholder="Ej: Tech Solutions S.L."
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  variant="outlined" 
                  label="Teléfono" 
                  value={referencia.telefono} 
                  onChange={(e) => updateReferencia(referencia.id, 'telefono', e.target.value)}
                  fullWidth 
                  placeholder="+34 123 456 789"
                  type="tel"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  variant="outlined" 
                  label="Email" 
                  value={referencia.email} 
                  onChange={(e) => updateReferencia(referencia.id, 'email', e.target.value)}
                  fullWidth 
                  placeholder="maria.gonzalez@empresa.com"
                  type="email"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {referencias.length === 0 && (
        <Card sx={{ mb: 3, border: '2px dashed #ccc', backgroundColor: '#f9f9f9' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No has agregado ninguna referencia aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Haz clic en "Agregar Referencia" para comenzar
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Información sobre referencias */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💡 Consejos para las referencias:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Solicita permiso:</strong> Siempre pide autorización antes de incluir a alguien como referencia
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Personas relevantes:</strong> Elige supervisores, colegas o clientes que conozcan tu trabajo
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Datos actualizados:</strong> Verifica que la información de contacto esté actualizada
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Variedad:</strong> Incluye referencias de diferentes contextos profesionales si es posible
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Opcional:</strong> Las referencias no son obligatorias, pero pueden ser muy valiosas
          </Typography>
        </Box>
      </Box>
    </>
  );
};

import React, { memo } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActionArea,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';

export const TemplateSelector = memo(({ selectedTemplate, onTemplateChange }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
        🎨 Selecciona una Plantilla
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Elige el diseño que mejor se adapte a tu perfil profesional. Puedes cambiar de plantilla en cualquier momento.
      </Typography>

      <RadioGroup
        value={selectedTemplate}
        onChange={(e) => onTemplateChange(e.target.value)}
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          {/* Plantilla Moderna */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                border: selectedTemplate === 'moderna' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                backgroundColor: selectedTemplate === 'moderna' ? '#f0f8ff' : 'white',
                transition: 'all 0.3s ease'
              }}
            >
              <CardActionArea onClick={() => onTemplateChange('moderna')}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel 
                      value="moderna" 
                      control={<Radio />} 
                      label="" 
                      sx={{ m: 0, mr: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      🎨 Plantilla Moderna
                    </Typography>
                  </Box>
                  
                  {/* Preview visual de la plantilla moderna */}
                  <Box sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    p: 2, 
                    backgroundColor: 'white',
                    mb: 2
                  }}>
                    {/* Header */}
                    <Box sx={{ 
                      backgroundColor: '#1976d2', 
                      color: 'white', 
                      p: 1.5, 
                      borderRadius: 1,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: 'white', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1976d2',
                        fontSize: '12px'
                      }}>
                        👤
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                          Juan Pérez
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '10px' }}>
                          Desarrollador Frontend
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Two column layout preview */}
                    <Box sx={{ display: 'flex', gap: 2, fontSize: '10px' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
                          💼 Experiencia
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: '9px' }}>
                          Desarrollador en TechCorp
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
                          🛠️ Habilidades
                        </Typography>
                        <Typography sx={{ fontSize: '9px' }}>
                          JavaScript • React • Node.js
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
                          🎓 Educación
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: '9px' }}>
                          Grado en Informática
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
                          🌍 Idiomas
                        </Typography>
                        <Typography sx={{ fontSize: '9px' }}>
                          Español • Inglés
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ideal para:</strong> Profesionales creativos, desarrolladores, diseñadores, marketing digital
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Características:</strong> Colores vibrantes, diseño de dos columnas, iconos, moderno
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Plantilla Elegante */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                border: selectedTemplate === 'elegante' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                backgroundColor: selectedTemplate === 'elegante' ? '#f0f8ff' : 'white',
                transition: 'all 0.3s ease'
              }}
            >
              <CardActionArea onClick={() => onTemplateChange('elegante')}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel 
                      value="elegante" 
                      control={<Radio />} 
                      label="" 
                      sx={{ m: 0, mr: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E5266' }}>
                      💼 Plantilla Elegante
                    </Typography>
                  </Box>
                  
                  {/* Preview visual de la plantilla elegante */}
                  <Box sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    p: 2, 
                    backgroundColor: 'white',
                    mb: 2
                  }}>
                    {/* Two column layout with colored left sidebar */}
                    <Box sx={{ display: 'flex', gap: 1, fontSize: '10px' }}>
                      {/* Left column - colored */}
                      <Box sx={{ 
                        flex: 0.4, 
                        backgroundColor: '#2E5266', 
                        color: 'white', 
                        p: 1, 
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: 'white', 
                          borderRadius: '50%',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2E5266',
                          fontSize: '8px'
                        }}>
                          👤
                        </Box>
                        <Typography sx={{ fontSize: '8px', mb: 0.5, textAlign: 'center' }}>
                          CONTACTO
                        </Typography>
                        <Typography sx={{ fontSize: '7px', mb: 0.3 }}>
                          📍 Dirección
                        </Typography>
                        <Typography sx={{ fontSize: '7px', mb: 0.3 }}>
                          📞 Teléfono
                        </Typography>
                        <Typography sx={{ fontSize: '7px', mb: 0.5 }}>
                          ✉️ Email
                        </Typography>
                        <Typography sx={{ fontSize: '8px', mb: 0.5, textAlign: 'center' }}>
                          APTITUDES
                        </Typography>
                        <Typography sx={{ fontSize: '7px' }}>
                          • Trabajo en equipo
                        </Typography>
                      </Box>
                      
                      {/* Right column - white */}
                      <Box sx={{ flex: 0.6 }}>
                        <Typography sx={{ 
                          fontWeight: 'bold', 
                          color: '#2E5266', 
                          fontSize: '12px',
                          mb: 1
                        }}>
                          JUAN PÉREZ
                        </Typography>
                        
                        <Typography sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '8px',
                          color: '#333',
                          borderBottom: '1px solid #ccc',
                          pb: 0.3,
                          mb: 0.5
                        }}>
                          IDIOMAS
                        </Typography>
                        <Typography sx={{ fontSize: '7px', mb: 1 }}>
                          • Español • Inglés
                        </Typography>
                        
                        <Typography sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '8px',
                          color: '#333',
                          borderBottom: '1px solid #ccc',
                          pb: 0.3,
                          mb: 0.5
                        }}>
                          EXPERIENCIA
                        </Typography>
                        <Typography sx={{ fontSize: '7px' }}>
                          Desarrollador en TechCorp
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ideal para:</strong> Profesionales, ejecutivos, consultores, especialistas técnicos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Características:</strong> Columna izquierda colorida, diseño asimétrico, muy profesional
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Plantilla Clásica */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                border: selectedTemplate === 'clasica' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                backgroundColor: selectedTemplate === 'clasica' ? '#f0f8ff' : 'white',
                transition: 'all 0.3s ease'
              }}
            >
              <CardActionArea onClick={() => onTemplateChange('clasica')}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel 
                      value="clasica" 
                      control={<Radio />} 
                      label="" 
                      sx={{ m: 0, mr: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#424242' }}>
                      📄 Plantilla Clásica
                    </Typography>
                  </Box>
                  
                  {/* Preview visual de laa plantilla clásica */}
                  <Box sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    p: 2, 
                    backgroundColor: 'white',
                    mb: 2
                  }}>
                    {/* Header */}
                    <Box sx={{ 
                      borderBottom: '2px solid #424242', 
                      pb: 1, 
                      mb: 2 
                    }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '14px',
                        color: '#424242'
                      }}>
                        JUAN PÉREZ
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#666',
                        fontSize: '10px'
                      }}>
                        Desarrollador Frontend • juan.perez@email.com • +34 123 456 789
                      </Typography>
                    </Box>
                    
                    {/* Single column layout preview */}
                    <Box sx={{ fontSize: '10px' }}>
                      <Typography sx={{ 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        fontSize: '9px',
                        color: '#424242',
                        mb: 0.5,
                        borderBottom: '1px solid #ccc',
                        pb: 0.2
                      }}>
                        EXPERIENCIA PROFESIONAL
                      </Typography>
                      <Typography sx={{ mb: 1, fontSize: '9px' }}>
                        Desarrollador Frontend | TechCorp | 2020 - Actualidad
                      </Typography>
                      
                      <Typography sx={{ 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        fontSize: '9px',
                        color: '#424242',
                        mb: 0.5,
                        borderBottom: '1px solid #ccc',
                        pb: 0.2,
                        mt: 1
                      }}>
                        EDUCACIÓN
                      </Typography>
                      <Typography sx={{ fontSize: '9px' }}>
                        Grado en Ingeniería Informática | Universidad Complutense
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ideal para:</strong> Sectores tradicionales, finanzas, consultoría, administración
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Características:</strong> Diseño tradicional, monocromático, formato académico, profesional
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </RadioGroup>

      
    </>
  );
});

TemplateSelector.displayName = 'TemplateSelector';

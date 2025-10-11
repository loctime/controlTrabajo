import React from 'react';
import { Card, CardContent, CardActions, Box, Typography, Chip, IconButton, Divider, Link } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LanguageIcon from '@mui/icons-material/Language';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import ControlFileAvatar from '../../../common/ControlFileAvatar';

export const CVCard = ({ 
  cv, 
  currentView, 
  statusChip, 
  onPreview, 
  onDownload, 
  onApprove, 
  onReject, 
  onDelete 
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Badge de estado */}
      <Chip 
        label={statusChip.label} 
        color={statusChip.color} 
        size="small"
        sx={{ 
          position: 'absolute',
          top: -8,
          right: -8,
          zIndex: 1,
          fontWeight: 'bold',
          boxShadow: 2
        }}
      />
      
      {/* Badge de tipo de CV */}
      {cv.cvGenerado !== undefined && (
        <Chip 
          label={cv.cvGenerado ? "🎨 CV Generado" : "📄 PDF Subido"} 
          color={cv.cvGenerado ? "primary" : "secondary"} 
          size="small"
          sx={{ 
            position: 'absolute',
            top: -8,
            left: -8,
            zIndex: 1,
            fontWeight: 'bold',
            boxShadow: 2,
            fontSize: '0.7rem'
          }}
        />
      )}
      
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ mr: 2 }}>
              <ControlFileAvatar fileId={cv.Foto} sx={{ width: 64, height: 64 }} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 1 }}>
                {cv.Nombre} {cv.Apellido}
              </Typography>
              
              {cv.Email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      wordBreak: 'break-word',
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {cv.Email}
                  </Typography>
                </Box>
              )}

              {cv.telefono && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {cv.telefono}
                  </Typography>
                </Box>
              )}

              {cv.sitioWeb && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LanguageIcon fontSize="small" color="action" />
                  <Link 
                    href={cv.sitioWeb} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ fontSize: '0.75rem', textDecoration: 'none' }}
                  >
                    Sitio Web
                  </Link>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ mt: 0.5, mb: 1 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(cv.categoriaGeneral || cv.Profesion) && (
                <Box sx={{ flex: 1, minWidth: '120px' }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                    {cv.categoriaGeneral || cv.Profesion}
                  </Typography>
                </Box>
              )}

              {(cv.ciudad || cv.Ciudad) && (
                <Box sx={{ flex: 1, minWidth: '120px' }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                    {cv.ciudad 
                      ? (cv.localidad ? `${cv.ciudad}, ${cv.localidad}` : cv.ciudad)
                      : cv.Ciudad || 'No especificada'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Badges informativos */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {cv.proyectos?.length > 0 && (
                <Chip 
                  icon={<CodeIcon />}
                  label={`${cv.proyectos.length} proyecto${cv.proyectos.length !== 1 ? 's' : ''}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
              
              {cv.habilidades?.length > 0 && (
                <Chip 
                  icon={<WorkIcon />}
                  label={`${cv.habilidades.length} habilidad${cv.habilidades.length !== 1 ? 'es' : ''}`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              )}
              
              {cv.idiomas?.length > 0 && (
                <Chip 
                  icon={<LanguageIcon />}
                  label={`${cv.idiomas.length} idioma${cv.idiomas.length !== 1 ? 's' : ''}`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              )}
              
              {cv.certificaciones?.length > 0 && (
                <Chip 
                  icon={<SchoolIcon />}
                  label={`${cv.certificaciones.length} certificación${cv.certificaciones.length !== 1 ? 'es' : ''}`} 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              )}
            </Box>

            {/* Top habilidades */}
            {cv.habilidades?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Habilidades destacadas:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                  {cv.habilidades.slice(0, 4).map((skill, index) => (
                    <Chip 
                      key={index}
                      label={skill.nombre || skill} 
                      size="small" 
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  ))}
                  {cv.habilidades.length > 4 && (
                    <Chip 
                      label={`+${cv.habilidades.length - 4} más`} 
                      size="small" 
                      color="default"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {currentView === 'rejected' && cv.motivoRechazo && (
              <Box 
                sx={{ 
                  mt: 1, 
                  p: 1.5, 
                  bgcolor: 'error.light', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'error.main'
                }}
              >
                <Typography variant="caption" color="error.dark" display="block" fontWeight="bold">
                  Motivo de rechazo:
                </Typography>
                <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>
                  {cv.motivoRechazo}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => onPreview(cv)} 
            title="Ver CV"
            color="primary"
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.main' }
            }}
          >
            <VisibilityIcon />
          </IconButton>
          
          <IconButton 
            onClick={() => onDownload(cv)} 
            title="Descargar CV"
            color="info"
            sx={{ 
              bgcolor: 'info.light', 
              color: 'info.contrastText',
              '&:hover': { bgcolor: 'info.main' }
            }}
          >
            <DownloadIcon />
          </IconButton>

          {currentView !== 'active' && (
            <>
              <IconButton 
                onClick={() => onApprove(cv)} 
                title="Aprobar CV"
                color="success"
                sx={{ 
                  bgcolor: 'success.light', 
                  color: 'success.contrastText',
                  '&:hover': { bgcolor: 'success.main' }
                }}
              >
                <ThumbUpIcon />
              </IconButton>
              
              <IconButton 
                onClick={() => onReject(cv)} 
                title="Rechazar CV"
                color="error"
                sx={{ 
                  bgcolor: 'error.light', 
                  color: 'error.contrastText',
                  '&:hover': { bgcolor: 'error.main' }
                }}
              >
                <ThumbDownIcon />
              </IconButton>
            </>
          )}

          <IconButton 
            onClick={() => onDelete(cv)} 
            title="Eliminar CV"
            color="error"
            sx={{ 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              '&:hover': { bgcolor: 'error.main' }
            }}
          >
            <DeleteForeverIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Box>
  );
};




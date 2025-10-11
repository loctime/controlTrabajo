import React, { useState } from 'react';
import { Card, CardContent, CardActions, Box, Typography, Chip, IconButton, Divider, Link, Tooltip, Popover } from '@mui/material';
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState({ type: '', data: [] });

  const handleClick = (event, type, data) => {
    setAnchorEl(event.currentTarget);
    setPopoverContent({ type, data });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setPopoverContent({ type: '', data: [] });
  };

  const open = Boolean(anchorEl);
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

            {/* Badges informativos - Chips compactos */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              {cv.proyectos?.length > 0 && (
                <Tooltip title={`Ver ${cv.proyectos.length} proyecto${cv.proyectos.length !== 1 ? 's' : ''}`} arrow>
                  <Chip 
                    icon={<CodeIcon />}
                    label={`${cv.proyectos.length}`}
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    onClick={(e) => handleClick(e, 'proyectos', cv.proyectos)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.light' }
                    }}
                  />
                </Tooltip>
              )}
              
              {cv.habilidades?.length > 0 && (
                <Tooltip title={`Ver ${cv.habilidades.length} habilidad${cv.habilidades.length !== 1 ? 'es' : ''}`} arrow>
                  <Chip 
                    icon={<WorkIcon />}
                    label={`${cv.habilidades.length}`}
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                    onClick={(e) => handleClick(e, 'habilidades', cv.habilidades)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'secondary.light' }
                    }}
                  />
                </Tooltip>
              )}
              
              {cv.idiomas?.length > 0 && (
                <Tooltip title={`Ver ${cv.idiomas.length} idioma${cv.idiomas.length !== 1 ? 's' : ''}`} arrow>
                  <Chip 
                    icon={<LanguageIcon />}
                    label={`${cv.idiomas.length}`}
                    size="small" 
                    color="success" 
                    variant="outlined"
                    onClick={(e) => handleClick(e, 'idiomas', cv.idiomas)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'success.light' }
                    }}
                  />
                </Tooltip>
              )}
              
              {cv.certificaciones?.length > 0 && (
                <Tooltip title={`Ver ${cv.certificaciones.length} certificación${cv.certificaciones.length !== 1 ? 'es' : ''}`} arrow>
                  <Chip 
                    icon={<SchoolIcon />}
                    label={`${cv.certificaciones.length}`}
                    size="small" 
                    color="info" 
                    variant="outlined"
                    onClick={(e) => handleClick(e, 'certificaciones', cv.certificaciones)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'info.light' }
                    }}
                  />
                </Tooltip>
              )}
            </Box>

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

      {/* Popover con detalles */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{ maxWidth: 300 }}
      >
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            {popoverContent.type === 'proyectos' && 'Proyectos'}
            {popoverContent.type === 'habilidades' && 'Habilidades'}
            {popoverContent.type === 'idiomas' && 'Idiomas'}
            {popoverContent.type === 'certificaciones' && 'Certificaciones'}
          </Typography>
          
          {popoverContent.type === 'proyectos' && (
            <Box>
              {popoverContent.data.map((proyecto, index) => (
                <Box key={index} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', flex: 1, mr: 1 }}>
                    {proyecto.nombre && proyecto.nombre.length > 20 
                      ? `${proyecto.nombre.substring(0, 20)}...` 
                      : proyecto.nombre}
                  </Typography>
                  {proyecto.url && (
                    <Link 
                      href={proyecto.url} 
                      target="_blank" 
                      rel="noopener" 
                      sx={{ fontSize: '0.75rem', textDecoration: 'none' }}
                    >
                      🔗
                    </Link>
                  )}
                </Box>
              ))}
            </Box>
          )}
          
          {popoverContent.type === 'habilidades' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {popoverContent.data.map((skill, index) => (
                <Chip 
                  key={index}
                  label={skill.nombre || skill} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}
          
          {popoverContent.type === 'idiomas' && (
            <Box>
              {popoverContent.data.map((idioma, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    {idioma.idioma || idioma}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {idioma.nivel || 'Nivel especificado'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          
          {popoverContent.type === 'certificaciones' && (
            <Box>
              {popoverContent.data.map((cert, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {cert.nombre}
                  </Typography>
                  {cert.institucion && (
                    <Typography variant="caption" color="text.secondary">
                      {cert.institucion}
                    </Typography>
                  )}
                  {cert.fecha && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {cert.fecha}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  );
};




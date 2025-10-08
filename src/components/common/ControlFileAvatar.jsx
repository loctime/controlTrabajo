import React, { useState, useEffect, useRef } from 'react';
import { Avatar, CircularProgress } from '@mui/material';
import { getDownloadUrl } from '../../lib/controlFileStorage';
import { shareUrlToImageUrl, isControlFileShareUrl } from '../../utils/shareUrl';

/**
 * Verifica si una cadena es una URL válida
 */
const isUrl = (str) => {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Verifica si es un share link de ControlFile
 */
const isControlFileShareLink = (str) => {
  return isControlFileShareUrl(str);
};


/**
 * Avatar que carga imágenes desde ControlFile o URLs directas
 * @param {string} fileId - ID del archivo en ControlFile o URL directa
 * @param {object} props - Props adicionales para el Avatar de MUI
 */
const ControlFileAvatar = ({ fileId, ...props }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    // Reset mounted flag
    isMounted.current = true;

    const loadImage = async () => {
      if (!fileId) {
        if (isMounted.current) {
          setLoading(false);
          setError(true);
        }
        return;
      }

      // Si es una URL directa
      if (isUrl(fileId)) {
        // Si es un enlace de ControlFile, convertir a enlace directo de imagen
        if (isControlFileShareLink(fileId)) {
          try {
            if (isMounted.current) {
              setLoading(true);
            }
            
            // Convertir enlace de compartido a enlace directo de imagen
            const directImageUrl = shareUrlToImageUrl(fileId);
            
            // Crear una imagen para verificar si el enlace directo funciona
            const img = new Image();
            img.onload = () => {
              if (isMounted.current) {
                setImageUrl(directImageUrl);
                setError(false);
                setLoading(false);
              }
            };
            img.onerror = () => {
              if (isMounted.current) {
                setError(true);
                setLoading(false);
              }
            };
            img.src = directImageUrl;
            return;
          } catch (err) {
            console.error('Error al cargar imagen de ControlFile:', err.message);
            if (isMounted.current) {
              setError(true);
              setLoading(false);
            }
            return;
          }
        }
        
        // Si es una URL directa (Firebase Storage u otra), usarla directamente
        if (isMounted.current) {
          setImageUrl(fileId);
          setError(false);
          setLoading(false);
        }
        return;
      }

      // Si es un fileId de ControlFile (no URL), obtener URL temporal
      try {
        if (isMounted.current) {
          setLoading(true);
        }
        
        const url = await getDownloadUrl(fileId);
        
        if (isMounted.current) {
          setImageUrl(url);
          setError(false);
        }
      } catch (err) {
        console.error('Error al cargar imagen de ControlFile:', err.message);
        if (isMounted.current) {
          setError(true);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup para evitar bucles infinitos
    return () => {
      isMounted.current = false;
    };
  }, [fileId]);

  if (loading) {
    return (
      <Avatar {...props}>
        <CircularProgress size={24} />
      </Avatar>
    );
  }

  if (error || !imageUrl) {
    return (
      <Avatar {...props} sx={{ bgcolor: 'grey.400', ...props.sx }}>
        ?
      </Avatar>
    );
  }

  return <Avatar src={imageUrl} {...props} />;
};

export default ControlFileAvatar;


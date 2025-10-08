import React, { useState, useEffect, useRef } from 'react';
import { Avatar, CircularProgress, Skeleton } from '@mui/material';
import { getDownloadUrl } from '../../lib/controlFileStorage';
import { shareUrlToImageUrl, isControlFileShareUrl } from '../../utils/shareUrl';
import { getCachedImageUrl, setCachedImageUrl } from '../../utils/imageCache';

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
 * Avatar optimizado que carga imágenes desde ControlFile o URLs directas
 * Incluye lazy loading, cache y estados de carga mejorados
 * @param {string} fileId - ID del archivo en ControlFile o URL directa
 * @param {object} props - Props adicionales para el Avatar de MUI
 */
const ControlFileAvatar = ({ fileId, ...props }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const avatarRef = useRef(null);
  const isMounted = useRef(true);

  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px', // Cargar cuando esté a 50px de ser visible
        threshold: 0.1 
      }
    );

    if (avatarRef.current) {
      observer.observe(avatarRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const loadImage = async () => {
      if (!fileId || !isVisible) {
        if (isMounted.current && !fileId) {
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
            // Verificar cache persistente primero
            const cachedUrl = getCachedImageUrl(fileId);
            if (cachedUrl) {
              if (isMounted.current) {
                setImageUrl(cachedUrl);
                setError(false);
                setLoading(false);
              }
              return;
            }

            if (isMounted.current) {
              setLoading(true);
            }
            
            // Convertir enlace de compartido a enlace directo de imagen
            const directImageUrl = shareUrlToImageUrl(fileId);
            
            // Crear una imagen para verificar si el enlace directo funciona
            const img = new Image();
            img.onload = () => {
              if (isMounted.current) {
                // Guardar en cache persistente
                setCachedImageUrl(fileId, directImageUrl);
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

    return () => {
      isMounted.current = false;
    };
  }, [fileId, isVisible]);

  if (loading) {
    return (
      <Avatar ref={avatarRef} {...props}>
        <Skeleton 
          variant="circular" 
          width="100%" 
          height="100%" 
          sx={{ 
            bgcolor: 'grey.200',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} 
        />
      </Avatar>
    );
  }

  if (error || !imageUrl) {
    return (
      <Avatar ref={avatarRef} {...props} sx={{ bgcolor: 'grey.400', ...props.sx }}>
        ?
      </Avatar>
    );
  }

  return <Avatar ref={avatarRef} src={imageUrl} {...props} />;
};

export default ControlFileAvatar;


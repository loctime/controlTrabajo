import { useState, useCallback } from 'react';

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Función para optimizar imagen automáticamente
  const optimizeImage = useCallback(async (file, options = {}) => {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.95,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calcular nuevas dimensiones manteniendo aspecto ratio
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          // Crear canvas para redimensionar
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;

          // Configurar alta calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: format,
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                reject(new Error('Error al procesar la imagen'));
              }
            },
            format,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Función para crear imagen circular optimizada para CV
  const createCircularImage = useCallback(async (file, size = 400) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Crear canvas cuadrado
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = size;
          canvas.height = size;

          // Configurar alta calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Calcular dimensiones con recorte inteligente centrado (crop to fill)
          const imgAspect = img.width / img.height;
          let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

          if (imgAspect > 1) {
            // Imagen más ancha que alta - recortar los lados para centrar
            const cropWidth = img.height; // Hacer cuadrada
            sourceX = (img.width - cropWidth) / 2;
            sourceWidth = cropWidth;
          } else {
            // Imagen más alta que ancha - recortar arriba y abajo para centrar
            const cropHeight = img.width; // Hacer cuadrada
            sourceY = (img.height - cropHeight) / 2;
            sourceHeight = cropHeight;
          }

          // Crear imagen completamente circular sin bordes
          ctx.save();
          
          // Crear máscara circular perfecta
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
          ctx.clip();

          // Dibujar imagen recortada y escalada al tamaño del canvas
          ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
          
          ctx.restore();

          // Convertir a blob con transparencia
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const circularFile = new File([blob], file.name, {
                  type: 'image/png',
                  lastModified: Date.now()
                });
                resolve(circularFile);
              } else {
                reject(new Error('Error al crear imagen circular'));
              }
            },
            'image/png'
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Función para validar archivo de imagen
  const validateImageFile = useCallback((file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 10MB.'
      };
    }

    return { isValid: true };
  }, []);

  // Función para obtener información de la imagen
  const getImageInfo = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          size: file.size,
          type: file.type
        });
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Función para manejar selección de archivo
  const handleFileSelect = useCallback((file) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setSelectedFile(file);
    setShowPreview(true);
    return file;
  }, [validateImageFile]);

  // Función para procesar y confirmar imagen
  const processAndConfirmImage = useCallback(async (file, options = {}) => {
    setIsProcessing(true);
    try {
      // Optimizar imagen
      const optimizedFile = await optimizeImage(file, options);
      
      // Crear versión circular para CV
      const circularFile = await createCircularImage(optimizedFile, 400);
      
      setShowPreview(false);
      setSelectedFile(null);
      setIsProcessing(false);
      
      return circularFile;
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  }, [optimizeImage, createCircularImage]);

  return {
    isProcessing,
    showPreview,
    selectedFile,
    optimizeImage,
    createCircularImage,
    validateImageFile,
    getImageInfo,
    handleFileSelect,
    processAndConfirmImage,
    setShowPreview,
    setSelectedFile
  };
};

import { useState } from 'react';
import Swal from 'sweetalert2';

// Mapa de zonas horarias a países
const TIMEZONE_COUNTRY_MAP = {
  'America/Argentina/Buenos_Aires': 'Argentina',
  'America/Argentina/Cordoba': 'Argentina',
  'America/Argentina/Mendoza': 'Argentina',
  'America/Argentina/Salta': 'Argentina',
  'America/Argentina/Tucuman': 'Argentina',
  'America/Argentina/Ushuaia': 'Argentina',
  'America/Mexico_City': 'México',
  'America/Mexico/BajaNorte': 'México',
  'America/Mexico/BajaSur': 'México',
  'America/Mexico/General': 'México',
  'America/New_York': 'Estados Unidos',
  'America/Los_Angeles': 'Estados Unidos',
  'America/Chicago': 'Estados Unidos',
  'America/Denver': 'Estados Unidos',
  'America/Toronto': 'Canadá',
  'America/Vancouver': 'Canadá',
  'Europe/Madrid': 'España',
  'Europe/Barcelona': 'España',
  'Europe/London': 'Reino Unido',
  'Europe/Paris': 'Francia',
  'Europe/Berlin': 'Alemania',
  'Europe/Rome': 'Italia',
  'America/Sao_Paulo': 'Brasil',
  'America/Bogota': 'Colombia',
  'America/Caracas': 'Venezuela',
  'America/Lima': 'Perú',
  'America/Santiago': 'Chile',
  'America/Montevideo': 'Uruguay',
};

export const useGeolocation = () => {
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Promisificar geolocation con mejor manejo de errores
  const getCurrentPositionPromise = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por este navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permisos de ubicación denegados';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado para obtener ubicación';
              break;
            default:
              errorMessage = 'Error desconocido al obtener ubicación';
              break;
          }
          reject(new Error(errorMessage));
        },
        { 
          timeout: 10000, 
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  };

  // Reverse geocoding usando una API gratuita
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
      );
      const data = await response.json();
      
      return {
        ciudad: data.city || data.locality,
        estado: data.principalSubdivision,
        pais: data.countryName
      };
    } catch (error) {
      console.log('Error en reverse geocoding:', error);
      return {};
    }
  };

  // Función para detectar país por timezone
  const detectCountryByTimezone = (timezone) => {
    return TIMEZONE_COUNTRY_MAP[timezone] || null;
  };

  // Función para detectar ubicación manualmente
  const detectLocationManually = async () => {
    try {
      setDetectingLocation(true);
      
      if (!navigator.geolocation) {
        Swal.fire("No soportado", "Tu navegador no soporta geolocalización.", "warning");
        return null;
      }

      const position = await getCurrentPositionPromise();
      if (position) {
        const { ciudad, estado, pais } = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
        
        if (ciudad || estado || pais) {
          Swal.fire(
            "Ubicación detectada",
            `Se detectó: ${ciudad || 'N/A'}, ${estado || 'N/A'}, ${pais || 'N/A'}`,
            "success"
          );
          return { ciudad, estado, pais };
        } else {
          Swal.fire("Sin datos", "No se pudo obtener información de ubicación.", "info");
          return null;
        }
      }
    } catch (error) {
      console.log('Error detectando ubicación:', error.message);
      
      let errorMessage = "No se pudo detectar la ubicación. ";
      if (error.message.includes('denegados')) {
        errorMessage += "Por favor, permite el acceso a la ubicación en tu navegador.";
      } else if (error.message.includes('no disponible')) {
        errorMessage += "La información de ubicación no está disponible.";
      } else if (error.message.includes('tiempo')) {
        errorMessage += "La solicitud tardó demasiado tiempo.";
      } else {
        errorMessage += "Por favor, complétala manualmente.";
      }
      
      Swal.fire("Error de ubicación", errorMessage, "warning");
      return null;
    } finally {
      setDetectingLocation(false);
    }
  };

  // Detectar ubicación de forma silenciosa (para auto-completado)
  const detectLocationSilently = async () => {
    try {
      if (!navigator.geolocation) {
        return null;
      }

      const position = await getCurrentPositionPromise();
      if (position) {
        const { ciudad, estado, pais } = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
        return { ciudad, estado, pais };
      }
      return null;
    } catch (error) {
      console.log('Geolocalización no disponible:', error.message);
      return null;
    }
  };

  return {
    detectingLocation,
    detectLocationManually,
    detectLocationSilently,
    detectCountryByTimezone,
    reverseGeocode
  };
};



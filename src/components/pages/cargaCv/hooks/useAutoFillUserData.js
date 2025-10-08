import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

export const useAutoFillUserData = (currentUser, currentCv) => {
  const [autoFillApplied, setAutoFillApplied] = useState(false);
  const { detectLocationSilently, detectCountryByTimezone } = useGeolocation();

  useEffect(() => {
    if (currentUser && !autoFillApplied && !currentCv) {
      autoFillData();
    }
  }, [currentUser, currentCv]);

  const autoFillData = async () => {
    const userData = {
      Email: currentUser.email || "",
      // Intentar extraer nombre y apellido del displayName
      ...(currentUser.displayName && {
        Nombre: currentUser.displayName.split(' ')[0] || "",
        Apellido: currentUser.displayName.split(' ').slice(1).join(' ') || ""
      }),
    };

    // Detectar país por timezone
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const detectedCountry = detectCountryByTimezone(timezone);
      if (detectedCountry) {
        userData.pais = detectedCountry;
      }
    } catch (error) {
      console.log('No se pudo detectar país por timezone:', error);
    }

    // Obtener ubicación por geolocalización (silencioso)
    try {
      const locationData = await detectLocationSilently();
      if (locationData) {
        if (locationData.ciudad) userData.ciudad = locationData.ciudad;
        if (locationData.estado) userData.estadoProvincia = locationData.estado;
        if (locationData.pais && !userData.pais) userData.pais = locationData.pais;
      }
    } catch (error) {
      console.log('Geolocalización no disponible:', error);
    }

    setAutoFillApplied(true);
    return userData;
  };

  return { autoFillData, autoFillApplied };
};



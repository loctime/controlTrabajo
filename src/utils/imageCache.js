/**
 * Sistema de cache persistente para URLs de imágenes de ControlFile
 * Combina localStorage (persistente) y sessionStorage (temporal)
 */

const CACHE_KEY = 'bolsatrabajo_image_cache';
const CACHE_VERSION = '1.0';
const MAX_CACHE_SIZE = 100; // Máximo 100 URLs en cache
const CACHE_EXPIRY_DAYS = 7; // Cache válido por 7 días

/**
 * Obtiene el cache desde localStorage
 */
function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { version: CACHE_VERSION, urls: {} };
    
    const parsed = JSON.parse(cached);
    
    // Verificar versión del cache
    if (parsed.version !== CACHE_VERSION) {
      clearCache();
      return { version: CACHE_VERSION, urls: {} };
    }
    
    // Limpiar URLs expiradas
    const now = Date.now();
    const validUrls = {};
    
    Object.entries(parsed.urls).forEach(([key, data]) => {
      if (now - data.timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
        validUrls[key] = data;
      }
    });
    
    return { version: CACHE_VERSION, urls: validUrls };
  } catch (error) {
    console.warn('Error leyendo cache de imágenes:', error);
    return { version: CACHE_VERSION, urls: {} };
  }
}

/**
 * Guarda el cache en localStorage
 */
function setCache(cache) {
  try {
    // Limitar tamaño del cache
    const urls = Object.entries(cache.urls);
    if (urls.length > MAX_CACHE_SIZE) {
      // Ordenar por timestamp y mantener solo los más recientes
      urls.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cache.urls = Object.fromEntries(urls.slice(0, MAX_CACHE_SIZE));
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error guardando cache de imágenes:', error);
  }
}

/**
 * Cache en memoria para la sesión actual
 */
const sessionCache = new Map();

/**
 * Obtiene una URL desde el cache (localStorage + sessionStorage)
 * @param {string} shareUrl - URL de share de ControlFile
 * @returns {string|null} URL de imagen directa o null si no está en cache
 */
export function getCachedImageUrl(shareUrl) {
  // 1. Verificar cache de sesión (más rápido)
  if (sessionCache.has(shareUrl)) {
    return sessionCache.get(shareUrl);
  }
  
  // 2. Verificar cache persistente
  const cache = getCache();
  const cachedData = cache.urls[shareUrl];
  
  if (cachedData) {
    const imageUrl = cachedData.imageUrl;
    // Guardar en cache de sesión para acceso rápido
    sessionCache.set(shareUrl, imageUrl);
    return imageUrl;
  }
  
  return null;
}

/**
 * Guarda una URL en el cache (localStorage + sessionStorage)
 * @param {string} shareUrl - URL de share de ControlFile
 * @param {string} imageUrl - URL de imagen directa
 */
export function setCachedImageUrl(shareUrl, imageUrl) {
  const now = Date.now();
  
  // 1. Guardar en cache de sesión
  sessionCache.set(shareUrl, imageUrl);
  
  // 2. Guardar en cache persistente
  const cache = getCache();
  cache.urls[shareUrl] = {
    imageUrl,
    timestamp: now
  };
  setCache(cache);
}

/**
 * Limpia todo el cache
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    sessionCache.clear();
    console.log('✅ Cache de imágenes limpiado');
  } catch (error) {
    console.warn('Error limpiando cache:', error);
  }
}

/**
 * Obtiene estadísticas del cache
 */
export function getCacheStats() {
  const cache = getCache();
  const sessionCount = sessionCache.size;
  const persistentCount = Object.keys(cache.urls).length;
  
  return {
    sessionCache: sessionCount,
    persistentCache: persistentCount,
    total: sessionCount + persistentCount
  };
}

/**
 * Precachea múltiples URLs (útil para preloading)
 * @param {Array} shareUrls - Array de URLs de share
 * @param {Function} imageUrlConverter - Función para convertir share URL a image URL
 */
export async function precacheUrls(shareUrls, imageUrlConverter) {
  const urlsToCache = shareUrls.filter(url => !getCachedImageUrl(url));
  
  if (urlsToCache.length === 0) {
    console.log('✅ Todas las URLs ya están en cache');
    return;
  }
  
  console.log(`📦 Precargando ${urlsToCache.length} URLs en cache...`);
  
  try {
    // Convertir URLs en paralelo
    const imageUrls = urlsToCache.map(shareUrl => {
      const imageUrl = imageUrlConverter(shareUrl);
      setCachedImageUrl(shareUrl, imageUrl);
      return imageUrl;
    });
    
    // Precargar imágenes
    await Promise.all(imageUrls.map(url => preloadImage(url)));
    console.log(`✅ ${urlsToCache.length} URLs precargadas y cacheadas`);
  } catch (error) {
    console.warn('Error precargando URLs:', error);
  }
}

/**
 * Precarga una imagen
 */
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

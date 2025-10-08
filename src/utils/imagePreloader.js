/**
 * Utilidades para preloading de imágenes
 */

/**
 * Precarga una imagen y retorna una promesa
 * @param {string} src - URL de la imagen a precargar
 * @returns {Promise<string>} Promesa que resuelve con la URL cuando la imagen está lista
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Precarga múltiples imágenes en paralelo
 * @param {string[]} srcs - Array de URLs de imágenes
 * @returns {Promise<string[]>} Promesa que resuelve con las URLs cuando todas están listas
 */
export function preloadImages(srcs) {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * Precarga las primeras N imágenes de una lista de CVs
 * @param {Array} cvs - Array de CVs con campo Foto
 * @param {number} count - Número de imágenes a precargar (default: 3)
 * @returns {Promise<void>} Promesa que resuelve cuando las imágenes están precargadas
 */
export async function preloadCriticalImages(cvs, count = 3) {
  if (!cvs || cvs.length === 0) return;
  
  const criticalCvs = cvs.slice(0, count);
  const imageUrls = criticalCvs
    .map(cv => cv.Foto)
    .filter(url => url && typeof url === 'string');
  
  if (imageUrls.length === 0) return;
  
  try {
    await preloadImages(imageUrls);
    console.log(`✅ Precargadas ${imageUrls.length} imágenes críticas`);
  } catch (error) {
    console.warn('⚠️ Error precargando imágenes críticas:', error);
  }
}

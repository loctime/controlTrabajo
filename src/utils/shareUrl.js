/**
 * Convierte una URL de share completa a URL de imagen directa
 * @param {string} shareUrl - URL completa de share de ControlFile
 * @returns {string} URL directa de imagen
 */
export function shareUrlToImageUrl(shareUrl) {
  // Extraer el token de la URL
  const match = shareUrl.match(/\/share\/([a-z0-9]+)/i);
  if (!match) {
    throw new Error('URL de share inválida');
  }
  
  const token = match[1];
  const baseUrl = shareUrl.split('/share/')[0];
  
  return `${baseUrl}/api/shares/${token}/image`;
}

/**
 * Extrae el token de una URL de share
 * @param {string} shareUrl - URL completa de share de ControlFile
 * @returns {string} Token del share
 */
export function extractShareToken(shareUrl) {
  const match = shareUrl.match(/\/share\/([a-z0-9]+)/i);
  if (!match) {
    throw new Error('URL de share inválida');
  }
  return match[1];
}

/**
 * Verifica si una URL es un enlace de share de ControlFile
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es un enlace de share de ControlFile
 */
export function isControlFileShareUrl(url) {
  return url && url.includes('/share/') && url.includes('controldoc.app');
}

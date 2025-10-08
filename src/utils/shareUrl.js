/**
 * Utilidades para manejo de URLs de ControlFile
 * 
 * ControlFile proporciona enlaces de compartido que no se pueden usar directamente
 * como imágenes. Estas funciones convierten los enlaces de share a URLs de imagen directa.
 * 
 * @example
 * // Convertir enlace de share a URL de imagen
 * const shareUrl = "https://files.controldoc.app/share/ky7pymrmm7o9w0e6ao97uv";
 * const imageUrl = shareUrlToImageUrl(shareUrl);
 * // Resultado: "https://files.controldoc.app/api/shares/ky7pymrmm7o9w0e6ao97uv/image"
 */

/**
 * Convierte una URL de share completa a URL de imagen directa
 * 
 * ControlFile genera enlaces de compartido con formato:
 * https://files.controldoc.app/share/TOKEN
 * 
 * Para mostrar imágenes directamente, necesitamos convertirlos a:
 * https://files.controldoc.app/api/shares/TOKEN/image
 * 
 * @param {string} shareUrl - URL completa de share de ControlFile
 * @returns {string} URL directa de imagen que se puede usar en <img> tags
 * @throws {Error} Si la URL no es válida o no contiene un token
 * 
 * @example
 * const shareUrl = "https://files.controldoc.app/share/abc123xyz";
 * const imageUrl = shareUrlToImageUrl(shareUrl);
 * // imageUrl = "https://files.controldoc.app/api/shares/abc123xyz/image"
 */
export function shareUrlToImageUrl(shareUrl) {
  // Extraer el token de la URL usando regex
  const match = shareUrl.match(/\/share\/([a-z0-9]+)/i);
  if (!match) {
    throw new Error('URL de share inválida: debe contener /share/TOKEN');
  }
  
  const token = match[1];
  const baseUrl = shareUrl.split('/share/')[0];
  
  return `${baseUrl}/api/shares/${token}/image`;
}

/**
 * Extrae el token de una URL de share de ControlFile
 * 
 * @param {string} shareUrl - URL completa de share de ControlFile
 * @returns {string} Token del share (parte después de /share/)
 * @throws {Error} Si la URL no es válida o no contiene un token
 * 
 * @example
 * const shareUrl = "https://files.controldoc.app/share/abc123xyz";
 * const token = extractShareToken(shareUrl);
 * // token = "abc123xyz"
 */
export function extractShareToken(shareUrl) {
  const match = shareUrl.match(/\/share\/([a-z0-9]+)/i);
  if (!match) {
    throw new Error('URL de share inválida: debe contener /share/TOKEN');
  }
  return match[1];
}

/**
 * Verifica si una URL es un enlace de share de ControlFile
 * 
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es un enlace de share de ControlFile válido
 * 
 * @example
 * const url1 = "https://files.controldoc.app/share/abc123";
 * const url2 = "https://firebasestorage.googleapis.com/...";
 * 
 * isControlFileShareUrl(url1); // true
 * isControlFileShareUrl(url2); // false
 */
export function isControlFileShareUrl(url) {
  return url && 
         typeof url === 'string' && 
         url.includes('/share/') && 
         url.includes('controldoc.app');
}

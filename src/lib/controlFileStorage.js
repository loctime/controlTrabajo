import { auth } from '../firebaseAuthControlFile';

const BACKEND = import.meta.env.VITE_CONTROLFILE_BACKEND;

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('No autenticado');
  return user.getIdToken();
}

/**
 * Sube un archivo a ControlFile Storage
 * @param {File} file - Archivo a subir
 * @param {string|null} parentId - ID de carpeta padre (null para raíz)
 * @param {function} onProgress - Callback para progreso (0-100)
 * @returns {Promise<string>} fileId del archivo subido
 */
export async function uploadFile(file, parentId = null, onProgress) {
  const token = await getToken();
  
  // 1. Presign - Solicitar sesión de subida
  const presign = await fetch(`${BACKEND}/api/uploads/presign`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      mime: file.type,
      parentId,
    }),
  }).then(r => r.json());
  
  // 2. Upload via proxy (evita CORS)
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    
    xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error('Network error during upload'));
    
    xhr.open('POST', `${BACKEND}/api/uploads/proxy-upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    const form = new FormData();
    form.append('file', file);
    form.append('sessionId', presign.uploadSessionId);
    xhr.send(form);
  });
  
  // 3. Confirm - Confirmar que el archivo se subió correctamente
  const confirm = await fetch(`${BACKEND}/api/uploads/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uploadSessionId: presign.uploadSessionId }),
  }).then(r => r.json());
  
  return confirm.fileId;
}

/**
 * Obtiene URL temporal de descarga (válida por 5 minutos)
 * @param {string} fileIdOrShareUrl - ID del archivo o URL de compartido
 * @returns {Promise<string>} URL temporal de descarga
 */
export async function getDownloadUrl(fileIdOrShareUrl) {
  // Si ya es una URL, determinar si es share link o URL directa
  if (isUrl(fileIdOrShareUrl)) {
    // Si es un enlace de compartido de ControlFile, usar la API correcta
    if (fileIdOrShareUrl.includes('/s/') || fileIdOrShareUrl.includes('/share/')) {
      console.log('✅ Es un share link, obteniendo URL de descarga directa...');
      return await getDirectDownloadUrl(fileIdOrShareUrl);
    }
    
    // Si es una URL directa (Firebase Storage u otra), devolverla directamente
    console.log('✅ Es una URL directa, devolviendo directamente:', fileIdOrShareUrl);
    return fileIdOrShareUrl;
  }

  // Si es un fileId, obtener URL temporal
  const token = await getToken();
  
  const res = await fetch(`${BACKEND}/api/files/presign-get`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId: fileIdOrShareUrl }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Error del servidor:', errorText);
    throw new Error(`Error ${res.status}: ${errorText || 'No se pudo obtener la URL'}`);
  }

  const data = await res.json();
  
  if (!data.downloadUrl) {
    throw new Error('El servidor no devolvió una URL de descarga');
  }
  
  return data.downloadUrl;
}

/**
 * Verifica si una cadena es una URL válida
 * @param {string} str - Cadena a verificar
 * @returns {boolean} True si es URL válida
 */
function isUrl(str) {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina un archivo de ControlFile Storage
 * @param {string} fileId - ID del archivo a eliminar
 * @returns {Promise<void>}
 */
export async function deleteFile(fileId) {
  const token = await getToken();
  
  await fetch(`${BACKEND}/api/files/delete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId }),
  });
}

/**
 * Crea un enlace público de compartir para un archivo
 * @param {string} fileId - ID del archivo
 * @param {number} expiresInHours - Horas hasta que expire (por defecto 720 = 30 días)
 * @returns {Promise<string>} URL pública del archivo
 */
export async function createPublicShareLink(fileId, expiresInHours = 720) {
  const token = await getToken();
  
  const res = await fetch(`${BACKEND}/api/shares/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      fileId,
      expiresIn: expiresInHours 
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Error al crear share link:', errorText);
    throw new Error(`Error ${res.status}: ${errorText || 'No se pudo crear el enlace'}`);
  }

  const data = await res.json();
  
  if (!data.shareUrl) {
    throw new Error('El servidor no devolvió una URL de compartir');
  }
  
  return data.shareUrl;
}

/**
 * Obtiene la URL de descarga directa desde un enlace de compartido
 * @param {string} shareUrl - URL de compartido de ControlFile
 * @returns {Promise<string>} URL de descarga directa
 */
export async function getDirectDownloadUrl(shareUrl) {
  try {
    // Extraer el token del enlace de compartido
    let shareToken;
    
    if (shareUrl.includes('/share/')) {
      shareToken = shareUrl.split('/share/')[1];
    } else if (shareUrl.includes('/s/')) {
      shareToken = shareUrl.split('/s/')[1];
    } else {
      throw new Error('Formato de share URL no reconocido');
    }
    
    console.log('🔗 Obteniendo URL de descarga para shareToken:', shareToken);
    
    // Usar la API correcta: POST /api/shares/{token}/download
    const response = await fetch(`${BACKEND}/api/shares/${shareToken}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'No se pudo obtener la URL de descarga'}`);
    }
    
    const data = await response.json();
    
    if (!data.downloadUrl) {
      throw new Error('El servidor no devolvió una URL de descarga');
    }
    
    console.log('✅ URL de descarga obtenida:', data.downloadUrl);
    console.log('📁 Nombre del archivo:', data.fileName);
    console.log('📏 Tamaño del archivo:', data.fileSize, 'bytes');
    
    return data.downloadUrl;
  } catch (error) {
    console.error('❌ Error al obtener URL de descarga directa:', error);
    throw new Error(`No se pudo obtener la URL de descarga: ${error.message}`);
  }
}

/**
 * Busca una carpeta por nombre en un parentId específico
 * @param {string} name - Nombre de la carpeta a buscar
 * @param {string|null} parentId - ID de carpeta padre (null para raíz)
 * @returns {Promise<string|null>} folderId si existe, null si no existe
 */
async function findFolderByName(name, parentId = null) {
  const token = await getToken();
  
  try {
    const response = await fetch(
      `${BACKEND}/api/files/list?parentId=${parentId || 'null'}&pageSize=200`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) return null;
    
    const result = await response.json();
    const folder = result.items?.find(
      item => item.type === 'folder' && item.name === name
    );
    
    return folder ? folder.id : null;
  } catch (error) {
    console.error('Error buscando carpeta:', error);
    return null;
  }
}

/**
 * Crea o obtiene la carpeta principal de la aplicación
 * Esta carpeta aparecerá en el taskbar de ControlFile
 * @returns {Promise<string>} folderId de la carpeta principal
 */
export async function ensureAppFolder() {
  const token = await getToken();
  
  // 1. Buscar si ya existe la carpeta "BolsaTrabajo" en la raíz
  console.log('🔍 Buscando carpeta BolsaTrabajo existente...');
  const existingFolderId = await findFolderByName('BolsaTrabajo', null);
  
  if (existingFolderId) {
    console.log('✅ Carpeta BolsaTrabajo encontrada:', existingFolderId);
    return existingFolderId;
  }
  
  // 2. Si no existe, crear con source: "taskbar" en ambos lugares
  console.log('📁 Creando carpeta BolsaTrabajo con source: taskbar...');
  const response = await fetch(`${BACKEND}/api/folders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'BolsaTrabajo',
      parentId: null,
      icon: 'Briefcase',
      color: 'text-purple-600',
      source: 'taskbar',  // ← A nivel raíz
      metadata: {
        source: 'taskbar'  // ← También dentro de metadata por las dudas
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create taskbar folder: ${response.status}`);
  }
  
  const { folderId } = await response.json();
  console.log('✅ Carpeta BolsaTrabajo creada:', folderId);
  return folderId;
}

/**
 * Lista archivos en una carpeta
 * @param {string|null} parentId - ID de carpeta padre (null para raíz)
 * @returns {Promise<Array>} Lista de archivos y carpetas
 */
export async function listFiles(parentId = null) {
  const token = await getToken();
  const url = `${BACKEND}/api/files/list?parentId=${parentId || 'null'}&pageSize=200`;
  
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json());
  
  return res.items || [];
}

/**
 * Crea una subcarpeta (o la retorna si ya existe)
 * @param {string} name - Nombre de la carpeta
 * @param {string|null} parentId - ID de carpeta padre
 * @returns {Promise<string>} folderId de la carpeta creada o existente
 */
export async function createFolder(name, parentId = null) {
  const token = await getToken();
  
  // 1. Primero buscar si ya existe
  const existingFolderId = await findFolderByName(name, parentId);
  if (existingFolderId) {
    console.log(`✅ Carpeta "${name}" ya existe:`, existingFolderId);
    return existingFolderId;
  }
  
  // 2. Si no existe, crear nueva
  console.log(`📁 Creando nueva carpeta "${name}"...`);
  const response = await fetch(`${BACKEND}/api/folders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: name,
      parentId: parentId,
      icon: 'Folder',
      color: 'text-blue-600',
      source: 'navbar'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.status}`);
  }
  
  const result = await response.json();
  console.log(`✅ Carpeta "${name}" creada:`, result.folderId);
  return result.folderId;
}


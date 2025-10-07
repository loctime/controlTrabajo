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
 * @param {string} fileId - ID del archivo
 * @returns {Promise<string>} URL temporal de descarga
 */
export async function getDownloadUrl(fileId) {
  const token = await getToken();
  
  const res = await fetch(`${BACKEND}/api/files/presign-get`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId }),
  }).then(r => r.json());
  
  return res.downloadUrl;
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
 * Crea o obtiene la carpeta principal de la aplicación
 * @returns {Promise<string>} folderId de la carpeta principal
 */
export async function ensureAppFolder() {
  const token = await getToken();
  
  const response = await fetch(
    `${BACKEND}/api/folders/root?name=BolsaTrabajo&pin=1`,
    { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      } 
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to create app folder: ${response.status}`);
  }
  
  const { folderId } = await response.json();
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
 * Crea una subcarpeta
 * @param {string} name - Nombre de la carpeta
 * @param {string|null} parentId - ID de carpeta padre
 * @returns {Promise<string>} folderId de la carpeta creada
 */
export async function createFolder(name, parentId = null) {
  const token = await getToken();
  
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
  return result.folderId;
}


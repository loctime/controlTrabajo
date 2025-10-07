# 📁 Solución al Problema de Subida de Archivos

## 🔴 Error Actual

```
POST http://localhost:5173/undefined/api/uploads/presign 404 (Not Found)
```

**Causa**: La variable de entorno `VITE_CONTROLFILE_BACKEND` no está definida.

---

## ✅ Soluciones Disponibles

Tienes **2 opciones** para resolver este problema:

### Opción 1: Configurar ControlFile (Recomendado si tienes acceso) ⭐

#### Paso 1: Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# URL del backend de ControlFile
VITE_CONTROLFILE_BACKEND=https://controlfile.onrender.com

# EmailJS (opcional, si ya lo tienes configurado)
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_USER_TEMPLATE_ID=tu_template_usuario
VITE_EMAILJS_ADMIN_TEMPLATE_ID=tu_template_admin
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

#### Paso 2: Contactar al Administrador de ControlFile

Necesitas que el administrador de ControlFile te proporcione:

- ✅ URL del backend de ControlFile
- ✅ Configuración de CORS para tu dominio
- ✅ Claims de acceso para tus usuarios
- ✅ Migración de usuarios al Auth Central

Ver guía completa en: `integracion/GUIA_BACKEND.md`

#### Paso 3: Reiniciar el servidor de desarrollo

```bash
# Ctrl+C para detener el servidor actual
npm run dev
```

---

### Opción 2: Usar Firebase Storage (Alternativa Simple) 🔥

Si **NO tienes acceso a ControlFile** o quieres una solución más simple, puedes usar Firebase Storage.

#### Ventajas:
- ✅ Ya tienes Firebase configurado
- ✅ No requiere backend adicional
- ✅ Más simple de implementar
- ✅ Integración nativa con Firebase

#### Implementación:

**1. Crear archivo de utilidades para Firebase Storage:**

Crear `src/lib/firebaseStorage.js`:

```javascript
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { auth } from '../firebaseAuthControlFile';

const storage = getStorage();

/**
 * Sube un archivo a Firebase Storage
 * @param {File} file - Archivo a subir
 * @param {string} folder - Carpeta destino (ej: 'cv', 'fotos')
 * @param {function} onProgress - Callback para progreso (0-100)
 * @returns {Promise<string>} URL de descarga del archivo
 */
export async function uploadFile(file, folder = 'uploads', onProgress) {
  const user = auth.currentUser;
  if (!user) throw new Error('No autenticado');

  // Crear referencia con estructura: folder/userId/timestamp_nombreArchivo
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const filePath = `${folder}/${user.uid}/${fileName}`;
  const storageRef = ref(storage, filePath);

  // Crear tarea de subida
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progreso
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        // Error
        console.error('Error al subir archivo:', error);
        reject(error);
      },
      async () => {
        // Completado - obtener URL de descarga
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Elimina un archivo de Firebase Storage
 * @param {string} fileUrl - URL del archivo a eliminar
 */
export async function deleteFile(fileUrl) {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
}
```

**2. Actualizar `src/lib/controlFileStorage.js`:**

Reemplazar el contenido por:

```javascript
// Importar desde Firebase Storage en lugar de ControlFile
export { uploadFile, deleteFile } from './firebaseStorage';
```

**3. Configurar reglas de seguridad en Firebase Storage:**

En Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Permitir lectura y escritura solo a usuarios autenticados
      allow read, write: if request.auth != null;
      
      // Opcional: Limitar tamaño de archivos a 10MB
      allow write: if request.resource.size < 10 * 1024 * 1024;
    }
    
    // Regla específica para carpetas de usuarios
    match /cv/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /fotos/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**4. Actualizar Firebase Config si es necesario:**

Verificar que en `src/firebaseConfig.js` tengas `storageBucket`:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "tu-proyecto.appspot.com", // ← Asegúrate de tener esto
  messagingSenderId: "...",
  appId: "..."
};
```

**5. Actualizar `cargaCv.jsx` (Línea 83):**

El código actual ya debería funcionar, solo cambiar el folder:

```javascript
const handleFileUpload = async (file, type) => {
  if (!file) return;
  if (type === "Foto") setLoadingImage(true);
  if (type === "cv") setLoadingCv(true);

  try {
    // Ahora uploadFile usa Firebase Storage
    const folder = type === "Foto" ? "fotos" : "cv";
    let url = await uploadFile(file, folder, (progress) => {
      console.log(`Progreso: ${progress}%`);
    });
    
    setNewCv((prevCv) => ({ ...prevCv, [type]: url }));
    Swal.fire("Carga exitosa", `${type} cargado con éxito.`, "success");

    if (type === "Foto") {
      setIsImageLoaded(true);
      setLoadingImage(false);
    }
    if (type === "cv") {
      setIsCvLoaded(true);
      setLoadingCv(false);
    }
  } catch (error) {
    console.error(`Error al cargar ${type}:`, error);
    Swal.fire("Error", `Error al cargar ${type}. Inténtalo nuevamente.`, "error");
    if (type === "Foto") setLoadingImage(false);
    if (type === "cv") setLoadingCv(false);
  }
};
```

---

## 🔧 Comandos Útiles

### Crear archivo .env manualmente (Windows PowerShell):

```powershell
# Copiar el template
Copy-Item env.template .env

# Editar el archivo
notepad .env
```

### Verificar variables de entorno:

Agregar esto temporalmente en `src/lib/controlFileStorage.js`:

```javascript
console.log('BACKEND URL:', import.meta.env.VITE_CONTROLFILE_BACKEND);
```

---

## 📊 Comparación de Opciones

| Característica | ControlFile | Firebase Storage |
|---------------|-------------|------------------|
| **Configuración** | ⚠️ Compleja | ✅ Simple |
| **Dependencias** | Backend externo | Integrado |
| **Estructura de carpetas** | ✅ Avanzada | ⚙️ Manual |
| **Costo** | Variable | Gratis hasta 5GB |
| **Compartir archivos** | ✅ Nativo | ⚙️ Con código |
| **Mejor para** | Apps empresariales | Proyectos simples |

---

## 🚀 Próximos Pasos

### Si eliges ControlFile:
1. ✅ Crear archivo `.env`
2. ✅ Contactar administrador de ControlFile
3. ✅ Obtener URL del backend
4. ✅ Configurar variables de entorno
5. ✅ Reiniciar servidor de desarrollo

### Si eliges Firebase Storage:
1. ✅ Crear `src/lib/firebaseStorage.js`
2. ✅ Actualizar `src/lib/controlFileStorage.js`
3. ✅ Configurar reglas de seguridad en Firebase Console
4. ✅ Verificar `storageBucket` en Firebase Config
5. ✅ Probar subida de archivos

---

## ❓ ¿Necesitas ayuda?

- **Para ControlFile**: Ver `integracion/GUIA_BACKEND.md`
- **Para Firebase Storage**: [Documentación oficial](https://firebase.google.com/docs/storage)
- **Contacto admin ControlFile**: Ver `integracion/README.md`

---

¡Elige la opción que mejor se adapte a tu proyecto! 🎯


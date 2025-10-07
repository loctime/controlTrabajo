# ✅ Configuración de ControlFile - LISTA

## 🎯 Cambios Realizados

Se ha restaurado la configuración para usar **ControlFile** como sistema de almacenamiento de archivos.

### Archivos Actualizados:

1. ✅ `src/lib/controlFileStorage.js` - Configuración de ControlFile restaurada
2. ✅ `src/components/pages/cargaCv/cargaCv.jsx` - Subida a ControlFile
3. ✅ `.env` - Variable `VITE_CONTROLFILE_BACKEND` configurada

---

## 📋 Configuración Actual

### Variable de Entorno
```env
VITE_CONTROLFILE_BACKEND=https://controlfile.onrender.com
```
✅ **Configurada correctamente**

---

## 🚀 Próximos Pasos

### 1. Reiniciar el Servidor de Desarrollo

**IMPORTANTE**: Debes reiniciar el servidor para que Vite cargue las variables de entorno del archivo `.env`.

```powershell
# Detener el servidor actual (Ctrl+C en la terminal donde corre)
# Luego reiniciar:
npm run dev
```

### 2. Verificar Requisitos de ControlFile

Para que la subida de archivos funcione, necesitas asegurarte de lo siguiente:

#### ✅ Checklist de Requisitos:

- [ ] **Backend de ControlFile activo** en `https://controlfile.onrender.com`
- [ ] **Usuarios migrados al Auth Central** de ControlFile
- [ ] **Claims de acceso configurados** para tus usuarios
- [ ] **CORS configurado** en el backend de ControlFile para tu dominio
- [ ] **Variables de Auth Central** configuradas en tu proyecto

#### Variables de Auth Central Necesarias:

Verifica que en tu archivo `.env` tengas (o en las variables de entorno):

```env
# Auth Central de ControlFile
VITE_CONTROLFILE_AUTH_APIKEY=...
VITE_CONTROLFILE_AUTH_DOMAIN=...
VITE_CONTROLFILE_PROJECT_ID=...
VITE_CONTROLFILE_APP_ID=...

# Backend de ControlFile
VITE_CONTROLFILE_BACKEND=https://controlfile.onrender.com
```

---

## 🔧 Cómo Funciona la Subida de Archivos

### Flujo de Subida a ControlFile:

```
1. Usuario selecciona archivo
   ↓
2. uploadFile() obtiene token de Firebase Auth
   ↓
3. POST /api/uploads/presign
   - Crea sesión de subida
   - Devuelve uploadSessionId
   ↓
4. POST /api/uploads/proxy-upload
   - Sube archivo vía proxy
   - Muestra progreso
   ↓
5. POST /api/uploads/confirm
   - Confirma subida exitosa
   - Devuelve fileId
   ↓
6. fileId se guarda en Firestore (colección 'cv')
```

### Estructura de Datos:

El `fileId` retornado por ControlFile se guarda en tu Firestore así:

```javascript
{
  Nombre: "Juan",
  Apellido: "Pérez",
  Foto: "file_abc123",  // ← fileId de ControlFile
  cv: "file_def456",    // ← fileId de ControlFile
  // ... resto de campos
}
```

Para descargar el archivo después:
```javascript
import { getDownloadUrl } from '../lib/controlFileStorage';

const downloadUrl = await getDownloadUrl(fileId);
// downloadUrl es una URL temporal válida por 5 minutos
```

---

## 🧪 Probar la Integración

### Test Manual:

1. **Iniciar sesión** en la aplicación
2. **Ir a "Cargar CV"**
3. **Seleccionar archivo de foto**
   - Observa el progreso en la consola
   - Debe mostrar: `Progreso de Foto: X%`
4. **Seleccionar archivo de CV**
   - Observa el progreso en la consola
   - Debe mostrar: `Progreso de cv: X%`
5. **Verificar mensaje de éxito**
6. **Enviar el formulario**

### Verificar en ControlFile:

Si tienes acceso a la interfaz de ControlFile:
1. Iniciar sesión en ControlFile
2. Buscar carpeta "BolsaTrabajo"
3. Verificar que los archivos se subieron

---

## ⚠️ Solución de Problemas

### Error: "POST .../undefined/api/uploads/presign 404"

**Causa**: Variable de entorno no cargada

**Solución**:
```powershell
# Reiniciar el servidor de desarrollo
npm run dev
```

### Error: "401 Unauthorized"

**Causa**: Token de autenticación inválido o expirado

**Solución**:
- Cerrar sesión y volver a iniciar sesión
- Verificar que el usuario esté en el Auth Central de ControlFile

### Error: "403 Forbidden"

**Causa**: Usuario no tiene claims de acceso configurados

**Solución**:
Contactar al administrador de ControlFile para ejecutar:
```bash
node scripts/set-claims.js \
  --email usuario@ejemplo.com \
  --apps controlfile,bolsatrabajo \
  --plans controlfile=pro;bolsatrabajo=basic
```

### Error: "CORS policy"

**Causa**: Tu dominio no está en `ALLOWED_ORIGINS`

**Solución**:
Contactar al administrador de ControlFile para agregar:
- `http://localhost:5173` (desarrollo)
- Tu dominio de producción

### Error: "No default bucket"

**Este error ya NO debería aparecer** porque ahora usa ControlFile, no Firebase Storage.

---

## 📊 Diferencias entre ControlFile y Firebase Storage

| Aspecto | ControlFile | Firebase Storage |
|---------|-------------|------------------|
| **Almacenamiento** | Backblaze B2 | Google Cloud Storage |
| **Organización** | Carpetas inteligentes | Carpetas manuales |
| **URLs** | Temporales (5 min) | Permanentes |
| **Compartir** | Sistema nativo | URLs públicas |
| **Retorno** | `fileId` | URL directa |
| **Backend** | Externo (Render) | Integrado |

---

## 📞 Contacto con Administrador de ControlFile

Si tienes problemas, necesitas contactar al administrador de ControlFile para:

1. **Verificar que el backend esté activo**
   - URL: https://controlfile.onrender.com
   - Endpoint de salud: `GET /api/health`

2. **Configurar CORS** para tu dominio

3. **Asignar claims** a tus usuarios

4. **Verificar cuotas** de almacenamiento

Ver documentación completa en: `integracion/GUIA_BACKEND.md`

---

## 🎯 Siguiente Fase (Opcional)

Si quieres mejorar la integración con ControlFile:

### 1. Crear Carpetas Organizadas
```javascript
import { ensureAppFolder, createFolder } from '../lib/controlFileStorage';

// Crear carpeta principal "BolsaTrabajo"
const mainFolderId = await ensureAppFolder();

// Crear subcarpetas por usuario
const userFolderId = await createFolder(`Usuario_${userId}`, mainFolderId);

// Subir archivos a la carpeta del usuario
const fileId = await uploadFile(file, userFolderId);
```

### 2. Implementar Descarga de Archivos
```javascript
import { getDownloadUrl } from '../lib/controlFileStorage';

async function downloadFile(fileId, fileName) {
  const url = await getDownloadUrl(fileId);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
```

### 3. Implementar Eliminación de Archivos
```javascript
import { deleteFile } from '../lib/controlFileStorage';

async function removeFile(fileId) {
  await deleteFile(fileId);
  console.log('Archivo eliminado');
}
```

---

## 📚 Documentación de Referencia

- **API de ControlFile**: Ver `integracion/GUIA_BACKEND.md`
- **Integración Apps Externas**: Ver `integracion/GUIA_INTEGRACION_APPS_EXTERNAS.md`
- **Migración de Usuarios**: Ver `integracion/MIGRACION_USUARIOS.md`

---

## ✅ Resumen

1. ✅ **ControlFile configurado** correctamente
2. ✅ **Variable de entorno** configurada en `.env`
3. ✅ **Código actualizado** para usar ControlFile
4. ⚠️ **Reiniciar servidor** para aplicar cambios
5. ⚠️ **Verificar requisitos** de Auth Central y claims

---

**¡Reinicia el servidor y prueba la subida de archivos!** 🚀

```powershell
npm run dev
```


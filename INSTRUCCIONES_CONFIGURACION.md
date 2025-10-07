# 🔧 Instrucciones de Configuración - Firebase Storage

## ✅ Problema Resuelto

He configurado la aplicación para usar **Firebase Storage** en lugar de ControlFile. Ahora la subida de archivos debería funcionar correctamente.

## 📋 Pasos para Completar la Configuración

### 1. Verificar Firebase Storage en Firebase Console

1. **Ir a Firebase Console**: https://console.firebase.google.com
2. **Seleccionar tu proyecto**: Busca tu proyecto de Firebase
3. **Ir a Storage**: En el menú lateral, click en "Storage"
4. **Si no está habilitado**: Click en "Comenzar" para habilitar Storage

### 2. Configurar Reglas de Seguridad

1. En **Firebase Console → Storage → Rules**
2. **Copiar y pegar** el contenido del archivo `firebase-storage.rules`
3. Click en **"Publicar"**

**Reglas configuradas**:
- ✅ Solo usuarios autenticados pueden subir/descargar archivos
- ✅ Cada usuario solo puede escribir en su carpeta
- ✅ Límite de 10MB para CVs, 5MB para fotos
- ✅ Estructura: `/cv/{userId}/` y `/fotos/{userId}/`

### 3. Verificar storageBucket en firebaseConfig.js

Abrir `src/firebaseConfig.js` y verificar que tenga la propiedad `storageBucket`:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "tu-proyecto.appspot.com", // ← DEBE ESTAR PRESENTE
  messagingSenderId: "...",
  appId: "..."
};
```

**Si falta `storageBucket`:**
1. Ir a Firebase Console → Configuración del proyecto (⚙️)
2. En "Tus apps", buscar tu app web
3. Copiar el valor de `storageBucket`
4. Agregarlo al archivo `firebaseConfig.js`

### 4. Reiniciar el Servidor de Desarrollo

```powershell
# Detener el servidor (Ctrl+C)
# Reiniciar
npm run dev
```

## 🧪 Probar la Subida de Archivos

1. **Iniciar sesión** en la aplicación
2. **Ir a Cargar CV**
3. **Seleccionar foto de perfil** (máx 5MB)
4. **Seleccionar CV** (máx 10MB)
5. **Verificar que se suban correctamente**

## 📁 Archivos Modificados

✅ **Creados**:
- `src/lib/firebaseStorage.js` - Nueva implementación con Firebase Storage
- `firebase-storage.rules` - Reglas de seguridad
- `env.template` - Template para variables de entorno
- `SOLUCION_SUBIDA_ARCHIVOS.md` - Documentación completa

✅ **Modificados**:
- `src/lib/controlFileStorage.js` - Ahora usa Firebase Storage
- `src/components/pages/cargaCv/cargaCv.jsx` - Actualizado para usar carpetas

## 🔄 Cambiar a ControlFile (Opcional)

Si en el futuro quieres usar ControlFile:

1. **Crear archivo `.env`** en la raíz:
```env
VITE_CONTROLFILE_BACKEND=https://controlfile.onrender.com
```

2. **Editar `src/lib/controlFileStorage.js`**:
   - Comentar línea 9: `// export { uploadFile, deleteFile, getDownloadUrl } from './firebaseStorage';`
   - Descomentar todo el bloque de código de ControlFile (líneas 14-162)

3. **Contactar al administrador de ControlFile** para:
   - Obtener URL del backend
   - Migrar usuarios al Auth Central
   - Configurar CORS
   - Asignar claims de acceso

Ver documentación completa en: `SOLUCION_SUBIDA_ARCHIVOS.md`

## 📊 Estructura de Archivos en Firebase Storage

```
/cv/
  /{userId}/
    /1234567890_curriculum.pdf
    /1234567891_cv.pdf

/fotos/
  /{userId}/
    /1234567892_perfil.jpg
    /1234567893_foto.png
```

Cada archivo tiene:
- ✅ Timestamp para evitar duplicados
- ✅ Nombre original del archivo
- ✅ Organizado por usuario
- ✅ URLs permanentes de descarga

## ⚠️ Limitaciones de Firebase Storage (Plan Gratuito)

- **Almacenamiento**: 5 GB
- **Descargas**: 1 GB/día
- **Operaciones**: 50,000 lecturas/día, 20,000 escrituras/día

Para proyectos grandes, considera:
- Actualizar a plan Blaze (pay-as-you-go)
- Usar ControlFile para almacenamiento ilimitado

## 🆘 Solución de Problemas

### Error: "Firebase Storage is not configured"

**Solución**: Habilitar Storage en Firebase Console

### Error: "Permission denied"

**Solución**: 
1. Verificar que el usuario está autenticado
2. Verificar reglas de seguridad en Firebase Console
3. Verificar que `storageBucket` está en firebaseConfig.js

### Error: "File too large"

**Solución**: 
- Las fotos tienen límite de 5MB
- Los CVs tienen límite de 10MB
- Comprimir archivos antes de subir

### Los archivos no aparecen

**Solución**:
1. Verificar en Firebase Console → Storage que los archivos se subieron
2. Las URLs se guardan en Firestore (colección `cv`)
3. Verificar permisos de lectura en las reglas

## 📞 Soporte

- **Firebase Storage**: https://firebase.google.com/docs/storage
- **ControlFile**: Ver `integracion/GUIA_BACKEND.md`

---

¡Listo! Ahora puedes subir archivos sin problemas. 🚀


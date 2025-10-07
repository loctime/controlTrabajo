# 🚀 Integración con ControlFile Storage - Bolsa de Trabajo

## 📋 Resumen

Este proyecto ha sido actualizado para usar **ControlFile Storage** en lugar de Firebase Storage, manteniendo el Firestore actual para datos de usuarios y CVs.

### ✅ ¿Qué se ha implementado?

- **Auth Central de ControlFile**: Autenticación compartida con ControlFile
- **ControlFile Storage**: Almacenamiento de fotos y CVs en ControlFile
- **Firestore Separado**: Tu Firestore actual se mantiene intacto con todos los datos
- **Compatibilidad**: Código maneja archivos antiguos de Firebase Storage

## 📁 Estructura de Archivos

### Nuevos Archivos Creados

```
├── src/
│   ├── firebaseAuthControlFile.js     # ✨ Auth Central de ControlFile
│   └── lib/
│       └── controlFileStorage.js       # ✨ Cliente de ControlFile Storage
├── firestore.rules                     # ✨ Reglas de seguridad
├── scripts/
│   ├── export-users.sh                 # ✨ Script para exportar usuarios
│   └── list-emails.sh                  # ✨ Script para listar emails
├── MIGRACION_CONTROLFILE.md           # ✨ Guía de migración
├── CHECKLIST_INTEGRACION.md           # ✨ Checklist de pasos
└── README_INTEGRACION.md              # ✨ Este archivo
```

### Archivos Modificados

```
src/
├── firebaseConfig.js                   # ✏️ Ahora solo exporta db (Firestore)
└── components/
    ├── pages/
    │   ├── cargaCv/cargaCv.jsx        # ✏️ Usa ControlFile Storage
    │   ├── login/Login.jsx            # ✏️ Usa Auth Central
    │   ├── register/Register.jsx      # ✏️ Usa Auth Central
    │   └── forgotPassword/ForgotPassword.jsx # ✏️ Usa Auth Central
    └── layout/
        └── navbar/Navbar.jsx          # ✏️ Usa ControlFile para eliminar archivos
```

## 🔧 Configuración Rápida

### 1. Exportar Usuarios (Primero)

```bash
# Dar permisos de ejecución
chmod +x scripts/export-users.sh

# Ejecutar script de exportación
./scripts/export-users.sh
```

Esto creará `users-bolsatrabajo.json` con todos tus usuarios actuales.

### 2. Contactar a ControlFile

**Enviar al equipo de ControlFile:**
- 📧 Archivo `users-bolsatrabajo.json` (o lista de emails)
- 🌐 Dominios para CORS:
  - Local: `http://localhost:5173`
  - Producción: [tu-dominio.com]
- 💾 Cuota deseada: 5GB por usuario (sugerido)

**Solicitar:**
- ✅ Importación de usuarios al Auth Central
- ✅ Asignación de claims (app: "controltrabajo")
- ✅ Credenciales del Auth Central
- ✅ URL del backend de ControlFile

### 3. Configurar Variables de Entorno

Crear/actualizar archivo `.env` con las credenciales recibidas:

```env
# ========================================
# Auth Central de ControlFile (NUEVO)
# ========================================
VITE_CONTROLFILE_AUTH_APIKEY=AIza...              # ← Solicitar a ControlFile
VITE_CONTROLFILE_AUTH_DOMAIN=controlstorage-eb796.firebaseapp.com
VITE_CONTROLFILE_PROJECT_ID=controlstorage-eb796
VITE_CONTROLFILE_APP_ID=1:123...                  # ← Solicitar a ControlFile
VITE_CONTROLFILE_BACKEND=https://...              # ← Solicitar a ControlFile

# ========================================
# Tu Firestore para datos (MANTENER)
# ========================================
VITE_APIKEY=...                    # ← Mantener valor actual
VITE_AUTH=...                      # ← Mantener valor actual
VITE_PROJECT=bolsa-de-trabjo      # ← Mantener valor actual
VITE_STORAGE=...                   # ← Mantener valor actual
VITE_MESSAGING=...                 # ← Mantener valor actual
VITE_APPID=...                     # ← Mantener valor actual

# ========================================
# Otros (MANTENER)
# ========================================
VITE_ROL_ADMIN=admin
```

### 4. Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### 5. Probar Localmente

```bash
npm run dev
```

**Verificar:**
- ✅ Login funciona
- ✅ Carga de CV funciona
- ✅ Visualización de archivos funciona
- ✅ Datos de Firestore son accesibles

### 6. Desplegar a Producción

```bash
npm run build
# Seguir proceso normal de deploy
```

## 📚 Documentación

### Para Desarrolladores
- **`MIGRACION_CONTROLFILE.md`**: Guía detallada de migración
- **`CHECKLIST_INTEGRACION.md`**: Lista completa de verificación

### Para Revisión Técnica
- **`src/firebaseAuthControlFile.js`**: Configuración de Auth Central
- **`src/lib/controlFileStorage.js`**: Cliente de ControlFile con funciones completas
- **`firestore.rules`**: Reglas de seguridad de Firestore

## 🔍 Cómo Funciona

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                  TU APLICACIÓN                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend                          Backend                   │
│  ┌──────────────┐                 ┌──────────────┐          │
│  │ Auth Central │                 │   Firestore  │          │
│  │ (ControlFile)│                 │ (Tu proyecto)│          │
│  └──────┬───────┘                 └──────┬───────┘          │
│         │                                │                   │
│         │ ID Token                       │ Datos (CVs, etc) │
│         │                                │                   │
└─────────┼────────────────────────────────┼───────────────────┘
          │                                │
          ▼                                │
┌─────────────────────────────────────────┼───────────────────┐
│         ControlFile Backend             │                   │
│  • Valida token                         │                   │
│  • Verifica claims                      │                   │
│  • Gestiona archivos                    │                   │
│                                          │                   │
│  ┌────────────────┐  ┌─────────────────┴─┐                │
│  │  Backblaze B2  │  │ ControlFile        │                │
│  │  (Archivos)    │  │ Firestore          │                │
│  │  • Fotos       │  │ (Metadata archivos)│                │
│  │  • CVs         │  │                    │                │
│  └────────────────┘  └────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Subida de Archivos

1. Usuario selecciona archivo en frontend
2. Frontend llama `uploadFile(file)` de ControlFile Storage
3. Se solicita sesión de subida (presign)
4. Archivo se sube vía proxy a Backblaze B2
5. Se confirma subida y obtiene `fileId`
6. **fileId se guarda en tu Firestore** (no URL)
7. Para visualizar: se genera URL temporal (5 min) con `getDownloadUrl(fileId)`

### Datos Almacenados

**En TU Firestore** (mantiene todo):
```javascript
{
  cv/cvId: {
    Nombre: "Juan",
    Apellido: "Pérez",
    Email: "juan@example.com",
    Foto: "file_abc123",        // ← fileId de ControlFile
    cv: "file_xyz789",          // ← fileId de ControlFile
    estado: "aprobado",
    // ... resto de datos
  }
}
```

**En ControlFile** (solo metadata de archivos):
```javascript
{
  files/fileId: {
    name: "curriculum.pdf",
    size: 1024000,
    userId: "uid_abc",
    // metadata del archivo
  }
}
```

**En Backblaze B2** (archivos físicos):
```
bucket/
└── file_xyz789.pdf  (archivo físico)
```

## 🔒 Seguridad

### Firestore Rules
- ✅ Solo usuarios autenticados pueden leer/escribir
- ✅ Usuarios solo pueden modificar sus propios CVs
- ✅ Admins pueden gestionar todos los CVs
- ✅ CVs pendientes solo visibles para el dueño y admins

### ControlFile Storage
- ✅ Autenticación con ID Token de Firebase
- ✅ Validación de claims (app: "controltrabajo")
- ✅ URLs temporales (5 minutos)
- ✅ Segregación por usuario (cada usuario solo ve sus archivos)

## ⚠️ Notas Importantes

### Compatibilidad con Archivos Antiguos
El código detecta automáticamente archivos antiguos de Firebase Storage:
- URLs que empiezan con `https://firebasestorage.googleapis.com` se mantienen
- Nuevos archivos se guardan como `fileId` de ControlFile
- Al eliminar, solo intenta eliminar archivos nuevos de ControlFile

### URLs Temporales
- Las URLs de descarga expiran en **5 minutos**
- Se regeneran automáticamente cada vez que el usuario hace clic en "Ver CV"
- **NO guardar URLs en Firestore**, solo guardar `fileId`

### Firestore Separado
- Tu Firestore actual **se mantiene intacto**
- Solo la autenticación se comparte con ControlFile
- Todos los datos (CVs, usuarios) siguen en tu Firestore
- Los UIDs de usuarios se preservan en la migración

## 🆘 Solución de Problemas

### Error 401 "Token inválido"
**Causa**: Variables de entorno de Auth Central no configuradas
**Solución**: Verificar que `.env` tenga las credenciales correctas de ControlFile

### Error 403 "App no permitida"
**Causa**: Usuario no tiene claims asignados
**Solución**: Solicitar al equipo de ControlFile que asigne claims para app "controltrabajo"

### Error CORS
**Causa**: Tu dominio no está en `ALLOWED_ORIGINS` del backend de ControlFile
**Solución**: Solicitar al equipo de ControlFile que agregue tu dominio

### Archivos no se suben
**Causa**: Backend URL incorrecta o no configurada
**Solución**: Verificar `VITE_CONTROLFILE_BACKEND` en `.env`

## 📞 Contacto

### Equipo de ControlFile
**Para coordinación de migración:**
- Código de app asignado: `controltrabajo`
- Script de claims que ejecutarán:
  ```bash
  node scripts/set-claims.js \
    --email usuario@ejemplo.com \
    --apps controlfile,controltrabajo \
    --plans controlfile=basic;controltrabajo=basic
  ```

## 📊 Estado del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Código | ✅ 100% | Implementado y sin errores |
| Migración de usuarios | ⏳ Pendiente | Script creado, requiere ejecución |
| Configuración | ⏳ Pendiente | Requiere credenciales de ControlFile |
| Testing | ⏳ Pendiente | Requiere configuración completa |
| Despliegue | ⏳ Pendiente | Después de testing exitoso |

## 🎯 Próximos Pasos

1. ✅ **Revisar código implementado** (Completado)
2. 🔄 **Exportar usuarios** (`./scripts/export-users.sh`)
3. 📧 **Contactar a ControlFile** (con lista de usuarios)
4. 🔑 **Recibir credenciales** y configurar `.env`
5. 🧪 **Probar en local**
6. 🚀 **Desplegar a producción**

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Estado:** ✅ Código listo, pendiente coordinación con ControlFile


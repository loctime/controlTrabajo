# 🔄 Guía de Migración a ControlFile Storage

## ✅ Archivos Creados/Modificados

### Nuevos Archivos
- ✅ `src/firebaseAuthControlFile.js` - Configuración de Auth Central
- ✅ `src/lib/controlFileStorage.js` - Cliente de ControlFile Storage
- ✅ `firestore.rules` - Reglas de seguridad de Firestore

### Archivos Modificados
- ✅ `src/firebaseConfig.js` - Ahora solo exporta `db` (Firestore)
- ✅ `src/components/pages/cargaCv/cargaCv.jsx` - Usa nuevo sistema de storage
- ✅ `src/components/pages/login/Login.jsx` - Usa Auth Central
- ✅ `src/components/pages/register/Register.jsx` - Usa Auth Central
- ✅ `src/components/pages/forgotPassword/ForgotPassword.jsx` - Usa Auth Central
- ✅ `src/components/layout/navbar/Navbar.jsx` - Usa ControlFile para eliminar archivos

## 📋 Pasos Pendientes (Coordinación con ControlFile)

### Fase 1: Migración de Usuarios

#### 1.1 Exportar usuarios actuales
```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login en Firebase
firebase login

# Exportar usuarios
firebase use bolsa-de-trabjo
firebase auth:export users-bolsatrabajo.json
```

#### 1.2 Enviar a ControlFile
Enviar al equipo de ControlFile:
- El archivo `users-bolsatrabajo.json` (o lista de emails)
- Solicitar importación al Auth Central
- Solicitar asignación de claims para app "controltrabajo"

#### 1.3 Recibir credenciales
Solicitar al equipo de ControlFile:
- `VITE_CONTROLFILE_AUTH_APIKEY`
- `VITE_CONTROLFILE_AUTH_DOMAIN`
- `VITE_CONTROLFILE_PROJECT_ID`
- `VITE_CONTROLFILE_APP_ID`
- `VITE_CONTROLFILE_BACKEND` (URL del backend)

### Fase 2: Configurar Variables de Entorno

Agregar al archivo `.env`:

```env
# Auth Central de ControlFile (NUEVO)
VITE_CONTROLFILE_AUTH_APIKEY=AIza... # Solicitar a ControlFile
VITE_CONTROLFILE_AUTH_DOMAIN=controlstorage-eb796.firebaseapp.com
VITE_CONTROLFILE_PROJECT_ID=controlstorage-eb796
VITE_CONTROLFILE_APP_ID=1:123... # Solicitar a ControlFile
VITE_CONTROLFILE_BACKEND=https://controlfile-backend.onrender.com

# Tu Firestore para datos (MANTENER valores actuales)
VITE_APIKEY=... # Mantener actual
VITE_AUTH=... # Mantener actual
VITE_PROJECT=bolsa-de-trabjo # Mantener actual
VITE_STORAGE=... # Mantener actual
VITE_MESSAGING=... # Mantener actual
VITE_APPID=... # Mantener actual

# Otros (MANTENER)
VITE_ROL_ADMIN=admin
```

### Fase 3: Configurar CORS en ControlFile

Solicitar al equipo de ControlFile que agregue tus dominios a `ALLOWED_ORIGINS`:
- Local: `http://localhost:5173` (o tu puerto)
- Producción: tu dominio actual

### Fase 4: Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### Fase 5: Testing

#### 5.1 Probar autenticación
1. Login con usuario existente
2. Verificar que el UID sea el mismo
3. Verificar acceso a datos en Firestore

#### 5.2 Probar subida de archivos
1. Cargar CV con foto
2. Verificar que se suben a ControlFile (verás `fileId` en lugar de URL)
3. Verificar que funciona la visualización

#### 5.3 Probar descarga
1. Hacer clic en "Ver CV" en la aplicación
2. Verificar que genera URL temporal y abre el PDF

#### 5.4 Probar eliminación
1. Eliminar un perfil de usuario
2. Verificar que archivos se eliminan de ControlFile

## 🔍 Verificación

### ✅ Checklist Pre-Despliegue
- [ ] Variables de entorno configuradas
- [ ] Usuarios migrados a Auth Central
- [ ] Claims asignados a usuarios (app: "controltrabajo")
- [ ] CORS configurado en backend de ControlFile
- [ ] Reglas de Firestore desplegadas
- [ ] Probado en local con al menos 1 usuario

### ✅ Checklist Post-Despliegue
- [ ] Login funciona correctamente
- [ ] Registro de nuevos usuarios funciona
- [ ] Carga de CV funciona
- [ ] Visualización de archivos funciona
- [ ] Eliminación de perfiles funciona
- [ ] Dashboard de admin funciona

## 📞 Contacto ControlFile

Para coordinar la migración, contactar al equipo de ControlFile:
- Código de app asignado: **"controltrabajo"**
- Script de claims que ejecutarán:
  ```bash
  node scripts/set-claims.js \
    --email usuario@ejemplo.com \
    --apps controlfile,controltrabajo \
    --plans controlfile=basic;controltrabajo=basic
  ```

## ⚠️ Notas Importantes

### Compatibilidad con Archivos Antiguos
El código maneja automáticamente archivos antiguos de Firebase Storage:
- Si detecta URLs de Firebase Storage, las deja intactas
- Nuevos archivos se guardan como `fileId` de ControlFile
- Al eliminar, solo intenta eliminar archivos nuevos de ControlFile

### URLs Temporales
- Las URLs de descarga expiran en 5 minutos
- Se regeneran automáticamente cada vez que el usuario hace clic en "Ver"
- No guardar URLs en Firestore, solo `fileId`

### Firestore Separado
- Tu Firestore actual se mantiene intacto
- Solo la autenticación se comparte con ControlFile
- Todos los datos (CVs, usuarios) siguen en tu Firestore

## 🚀 Próximos Pasos

1. **Exportar usuarios** (ejecutar comando de Fase 1.1)
2. **Contactar a ControlFile** con lista de usuarios
3. **Recibir credenciales** y configurar `.env`
4. **Probar en local** antes de desplegar
5. **Desplegar** cuando todo funcione

---

**Estado:** ✅ Código implementado, pendiente coordinación con ControlFile
**Última actualización:** Octubre 2025


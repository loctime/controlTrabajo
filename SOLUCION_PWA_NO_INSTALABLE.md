# 🔧 Solución: PWA dice "Instalable: NO"

## 🎯 Problema

El panel de debug muestra:
```
✅ Service Worker: OK
❌ Instalable: NO
✅ Navegador: Chrome
```

Pero Chrome **NO dispara el evento `beforeinstallprompt`**.

---

## 🔍 ¿Por qué pasa esto?

Chrome tiene **criterios estrictos** y **memoria caché** sobre qué apps son instalables:

### Razones Comunes:

1. **La app ya fue instalada antes** (aunque la hayas desinstalado)
2. **Chrome tiene en caché que "no es instalable"**
3. **El usuario rechazó la instalación anteriormente**
4. **Falta interacción del usuario** (aunque esto ya no debería ser necesario)
5. **Iconos incorrectos** (Chrome necesita PNG, no solo SVG)

---

## ✅ Solución Paso a Paso

### **Paso 1: Limpiar Caché de Chrome**

```bash
# 1. Abre Chrome DevTools
F12

# 2. Ve a: Application → Storage
# 3. Click en "Clear site data"
# 4. Marca todas las opciones
# 5. Click "Clear site data"
```

### **Paso 2: Desinstalar la App (si existe)**

```bash
# 1. En Chrome, ir a:
chrome://apps

# 2. Buscar "Bolsa de Trabajo CCF" o "BolsaTrabajo"
# 3. Si está instalada → Click derecho → "Desinstalar"
```

### **Paso 3: Cerrar TODAS las pestañas de localhost**

```bash
# Cerrar todas las pestañas que tengan:
http://localhost:5173
```

### **Paso 4: Abrir en Modo Incógnito**

```bash
# 1. Chrome → Ctrl+Shift+N (abrir ventana incógnito)
# 2. Ir a: http://localhost:5173
# 3. Esperar 10 segundos
# 4. Verificar el panel de debug
```

### **Paso 5: Si aún no funciona - Reiniciar Chrome Completamente**

```bash
# 1. Cerrar TODAS las ventanas de Chrome
# 2. Matar el proceso (por si acaso):
#    - Windows: Ctrl+Shift+Esc → Chrome → Finalizar tarea
# 3. Volver a abrir Chrome en modo incógnito
# 4. Ir a localhost:5173
```

---

## 🧪 Verificación

Después de seguir los pasos, deberías ver en el panel de debug:

```
✅ Service Worker: OK
✅ Instalable: SÍ  ← ¡Esto cambió!
❌ Instalado: NO

Logs:
10:35:22: ✅ Service Worker encontrado
10:35:22: ✅ Manifest.json cargado
10:35:27: 🎉 ¡EVENTO beforeinstallprompt DETECTADO!
```

Y el botón **"Instalar App"** debería aparecer en el Navbar.

---

## 🔥 Alternativa: Forzar la Instalación Manualmente

Si después de todo esto sigue sin funcionar, Chrome tiene una opción manual:

### En Chrome Desktop:

```bash
# 1. Con la app abierta en localhost:5173
# 2. Buscar el icono ⊕ en la barra de direcciones (esquina derecha)
# 3. Click en el icono
# 4. Click "Instalar"
```

### Si no ves el icono ⊕:

```bash
# 1. Chrome DevTools (F12)
# 2. Console → Ejecutar:
navigator.serviceWorker.getRegistration().then(r => console.log('SW:', r))

# 3. Application → Manifest → "Add to home screen" (botón en la parte superior)
```

---

## 📊 Checklist de Diagnóstico

Verifica que TODO esté en ✅:

- [ ] Service Worker registrado y **activo**
- [ ] Manifest.json cargable sin errores
- [ ] Iconos PNG de 192x192 y 512x512 existen
- [ ] La app NO está instalada en `chrome://apps`
- [ ] Caché de Chrome limpiado
- [ ] Probado en modo incógnito
- [ ] Chrome actualizado a última versión
- [ ] Esperado al menos 10 segundos después de cargar

---

## 🎯 Razón Técnica del Problema

Chrome tiene **heurísticas internas** que determinan si una app es "digna" de instalación:

1. **Engagement del usuario** - Cuántas veces visitó la página
2. **Tiempo en la página** - Si pasó suficiente tiempo
3. **Historial de instalación** - Si la instaló y desinstaló antes

**Por eso el modo incógnito funciona mejor**: No tiene historial previo.

---

## 💡 Para Producción

En producción (HTTPS), Chrome es **mucho menos restrictivo**. Estos problemas suelen ser solo en localhost.

Una vez desplegado en Firebase Hosting con HTTPS:
- El botón aparecerá más rápido
- Chrome será más "generoso" con la instalación
- Menos problemas de caché

---

## 🚀 Próximo Paso

Después de limpiar el caché y abrir en incógnito:

1. Ve al panel de debug
2. Espera 10 segundos
3. Debería decir "Instalable: SÍ"
4. El botón "Instalar App" aparecerá en el Navbar
5. ¡Pruébalo!

---

## 📞 Si Nada Funciona

Última opción (nuclear):

```bash
# 1. Desinstalar Chrome
# 2. Reinstalar Chrome
# 3. Abrir en incógnito
# 4. Ir a localhost:5173
```

O simplemente **despliega a producción** y prueba desde ahí. En HTTPS real, Chrome es mucho más cooperativo.


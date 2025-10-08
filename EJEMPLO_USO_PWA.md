# 🎯 Ejemplo de Uso - Instalación PWA

## 🌟 Cómo se Ve en la App

### 1. **Navbar con Botón de Instalación**

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Inicio  📋 Cargar CV  📊 Mi CV    [📥 Instalar App]  👤 │
└─────────────────────────────────────────────────────────────┘
                                           ↑
                                    Botón visible cuando
                                    la app es instalable
```

### 2. **Flujo de Instalación**

```
Usuario visita la app
       ↓
Service Worker se registra
       ↓
Navegador detecta PWA
       ↓
Botón "Instalar App" aparece
       ↓
Usuario hace clic
       ↓
Prompt nativo del navegador
       ↓
Usuario acepta
       ↓
✅ App instalada
       ↓
Botón desaparece automáticamente
```

## 💻 Código Implementado

### En el Navbar:

```jsx
// src/components/layout/navbar/Navbar.jsx

import { usePWAInstall } from "../../../hooks/usePWAInstall";

function Navbar() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  const handleInstallPWA = async () => {
    const success = await installPWA();
    if (success) {
      showAlert.success('¡Instalado!', 'La app se ha instalado correctamente');
    }
  };

  return (
    <AppBar>
      <Toolbar>
        {/* ... menú ... */}
        
        {/* 👇 Este botón solo se muestra si NO está instalado Y es instalable */}
        {!isInstalled && isInstallable && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleInstallPWA}
          >
            Instalar App
          </Button>
        )}
        
        {/* ... avatar ... */}
      </Toolbar>
    </AppBar>
  )
}
```

## 🔄 Diferentes Estados del Botón

### Estado 1: App NO instalable aún
```
El navegador todavía no detectó que la app es una PWA válida
→ Botón NO se muestra
```

### Estado 2: App instalable pero NO instalada
```
El navegador detectó que es una PWA válida
→ Botón "Instalar App" VISIBLE ✅
```

### Estado 3: App YA instalada
```
El usuario ya instaló la app
→ Botón NO se muestra (se oculta automáticamente)
```

### Estado 4: App abierta como PWA instalada
```
Usuario abrió la app desde el icono instalado
→ Botón NO se muestra (isInstalled = true)
```

## 📱 Ejemplo en Diferentes Dispositivos

### 📱 **Android Chrome:**
```
1. Usuario visita la app en Chrome móvil
2. Después de unos segundos → Botón "Instalar App" aparece
3. Usuario toca el botón
4. Aparece diálogo nativo de Android:
   ┌─────────────────────────────────┐
   │  Agregar Bolsa de Trabajo CCF   │
   │  a la pantalla de inicio?        │
   │                                  │
   │  [Cancelar]      [Agregar]      │
   └─────────────────────────────────┘
5. Usuario toca "Agregar"
6. ✅ App instalada en pantalla de inicio
```

### 💻 **Desktop Chrome:**
```
1. Usuario visita la app en Chrome de escritorio
2. Botón "Instalar App" aparece en el navbar
3. Usuario hace clic
4. Aparece ventana de instalación:
   ┌──────────────────────────────────┐
   │ ¿Instalar Bolsa de Trabajo CCF?  │
   │                                   │
   │ La app se instalará en tu PC     │
   │                                   │
   │  [Cancelar]      [Instalar]      │
   └──────────────────────────────────┘
5. ✅ App instalada (se abre en ventana propia)
```

### 🍎 **Safari iOS:**
```
Safari NO soporta el evento beforeinstallprompt
→ Botón NO aparece

Para instalar en iOS:
1. Abrir Safari
2. Tocar botón compartir 🔗
3. Seleccionar "Agregar a pantalla de inicio"
```

## 🧪 Cómo Probarlo AHORA

### Opción 1: Desarrollo Local

```bash
# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en Chrome
http://localhost:5173

# 4. Esperar a que aparezca el botón "Instalar App"
#    (puede tardar 1-2 segundos)

# 5. Hacer clic en el botón

# 6. Aceptar la instalación
```

### Opción 2: Modo Incógnito (recomendado para pruebas)

```bash
# Chrome detecta mejor la PWA en incógnito
# porque no hay caché de instalaciones previas

1. Abrir Chrome en modo incógnito (Ctrl+Shift+N)
2. Visitar http://localhost:5173
3. El botón debería aparecer más rápidamente
```

### Opción 3: Producción

```bash
# 1. Build de producción
npm run build

# 2. Desplegar en Firebase
firebase deploy --only hosting

# 3. Visitar la URL de producción desde Chrome móvil
```

## 🔍 Ver Logs de Debug

Abre la consola de DevTools y verás:

```
✅ Service Worker registrado: /
PWA: ✅ Evento beforeinstallprompt capturado
[al hacer clic en el botón]
PWA: 📱 Mostrando prompt de instalación...
PWA: Respuesta del usuario: accepted
PWA: ✅ Instalación aceptada!
PWA: ✅ App instalada correctamente
```

## 🎨 Personalizar el Botón

Si quieres cambiar el estilo del botón:

```jsx
<Button
  variant="outlined"  // o "contained", "text"
  color="inherit"     // o "primary", "secondary"
  size="small"        // o "medium", "large"
  startIcon={<DownloadIcon />}
  onClick={handleInstallPWA}
  sx={{ 
    textTransform: "none",
    borderRadius: "20px",  // Botón más redondeado
    fontWeight: "bold",     // Texto en negrita
    // ... más estilos personalizados
  }}
>
  Instalar App
</Button>
```

## 🚀 Usar en Otras Páginas

Puedes agregar el botón en CUALQUIER componente:

### Ejemplo en Home.jsx:

```jsx
import { usePWAInstall } from '../../hooks/usePWAInstall'

function Home() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  return (
    <div>
      <h1>Bienvenido a Bolsa de Trabajo CCF</h1>
      
      {!isInstalled && isInstallable && (
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={installPWA}
          >
            📱 Instalar App en tu Dispositivo
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Accede más rápido desde tu pantalla de inicio
          </Typography>
        </Box>
      )}
    </div>
  )
}
```

## ✅ Checklist de Verificación

Antes de desplegar a producción, verifica:

- [ ] Service Worker se registra correctamente (ver consola)
- [ ] `manifest.json` está en `/public/manifest.json`
- [ ] Los iconos existen en `/public/icon-192.png` y `/public/icon-512.png`
- [ ] La app se sirve por HTTPS (en producción)
- [ ] El botón aparece en Chrome después de unos segundos
- [ ] Al hacer clic, aparece el prompt nativo
- [ ] Después de instalar, el botón desaparece
- [ ] La app instalada se abre en una ventana separada

## 🎉 ¡Listo!

Ya tienes instalación PWA con un solo clic. La próxima vez que un usuario visite tu app, verá el botón "Instalar App" y podrá instalarla inmediatamente sin buscar opciones en el menú del navegador.

---

**Diferencia clave con antes:**

❌ **Antes:** Usuario tenía que ir a Menu ⋮ → "Instalar app"
✅ **Ahora:** Usuario ve botón visible → Hace clic → Listo!


# 📱 Guía de Instalación PWA - ControlGastos

Esta guía explica cómo implementar la funcionalidad de instalación PWA (Progressive Web App) para móvil en tu aplicación Next.js.

## 🎯 Objetivo

Permitir que los usuarios instalen la aplicación web como una app nativa en sus dispositivos móviles, proporcionando una experiencia similar a las aplicaciones nativas.

## ⚡ Instalación Directa en Un Clic

Esta guía implementa un sistema de **instalación directa** donde el usuario solo necesita:

1. **Ver el botón "Instalar App"** (aparece automáticamente cuando la PWA es instalable)
2. **Hacer un clic** en el botón
3. **Confirmar en el diálogo del navegador** (prompt nativo)
4. **¡Listo!** La app se instala automáticamente

**No se requieren pasos adicionales, configuraciones manuales, ni descargas complejas.**

### ¿Por qué es "directa"?

- ✅ **Un solo clic**: El botón ejecuta `installPWA()` inmediatamente
- ✅ **Sin intermediarios**: No hay handlers o lógica compleja
- ✅ **Gestión automática**: El hook controla todos los estados
- ✅ **Feedback automático**: El botón desaparece cuando se instala

### Flujo Visual

```
Usuario → Click en "Instalar App" → Prompt del navegador → Aceptar → ¡Instalada!
          ↑                          ↑                      ↑
          Botón visible             Nativo                  Automático
```

## 📋 Requisitos Previos

- Next.js 14+
- TypeScript
- Componentes de UI (shadcn/ui recomendado)
- Service Worker habilitado

## 🛠️ Implementación Completa

### 1. Hook Personalizado: `usePWAInstall`

Crea el archivo `hooks/use-pwa-install.ts`:

```typescript
"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Error installing PWA:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}
```

### 2. Configuración del Manifest

Crea el archivo `public/manifest.json`:

```json
{
  "name": "GastosApp - Gestor de Gastos Fijos",
  "short_name": "GastosApp",
  "description": "Gestiona tus gastos fijos con facilidad",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.jpg",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.jpg",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 3. Metadatos PWA en Layout

Actualiza `app/layout.tsx`:

```typescript
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GastosApp - Gestor de Gastos Fijos",
  description: "Gestiona tus gastos fijos con facilidad",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GastosApp",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 4. Service Worker

Crea el archivo `public/sw.js`:

```javascript
const CACHE_NAME = "gastos-app-v1.0.0"
const STATIC_CACHE = "gastos-static-v1.0.0"
const DYNAMIC_CACHE = "gastos-dynamic-v1.0.0"

const urlsToCache = [
  "/",
  "/dashboard",
  "/history", 
  "/profile",
  "/manifest.json",
  "/icon-192.jpg",
  "/icon-512.jpg"
]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...")
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
  )
})

// Activar Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Interceptar requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver desde cache si está disponible
        if (response) {
          return response
        }
        
        // Si no está en cache, hacer fetch
        return fetch(event.request).then((response) => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clonar la respuesta
          const responseToCache = response.clone()

          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        })
      })
  )
})
```

### 5. Registro del Service Worker

Crea el archivo `app/register-sw.tsx`:

```typescript
"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }
  }, [])

  return null
}
```

### 6. Componente de Instalación

#### 🚀 Instalación Directa (Recomendada)

Esta es la forma más simple y directa. Al hacer clic, se ejecuta la instalación inmediatamente:

```typescript
"use client"

import { usePWAInstall } from "@/hooks/use-pwa-install"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function HeaderWithInstall() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  return (
    <header>
      <h1>Mi App</h1>
      
      {/* Botón de instalación directa - Un solo clic */}
      {!isInstalled && isInstallable && (
        <Button
          onClick={installPWA}  // 👈 Llamada directa
          variant="outline"
          size="sm"
          className="bg-secondary hover:bg-accent border-border"
        >
          <Download className="w-4 h-4 mr-2" />
          Instalar App
        </Button>
      )}
    </header>
  )
}
```

**¿Cómo funciona la instalación directa?**

1. **Usuario hace clic** → Se ejecuta `installPWA()` inmediatamente
2. **Se muestra el prompt nativo** → El navegador muestra su diálogo de instalación
3. **Usuario acepta/rechaza** → La app se instala o no según la elección
4. **Resultado automático** → El botón desaparece si se instaló correctamente

#### 📊 Instalación con Feedback (Opcional)

Si necesitas mostrar feedback adicional o manejar el resultado:

```typescript
"use client"

import { usePWAInstall } from "@/hooks/use-pwa-install"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function HeaderWithFeedback() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  const handleInstall = async () => {
    const installed = await installPWA()
    
    if (installed) {
      toast.success("¡App instalada correctamente!")
    } else {
      toast.info("Instalación cancelada")
    }
  }

  return (
    <header>
      <h1>Mi App</h1>
      
      {!isInstalled && isInstallable && (
        <Button onClick={handleInstall} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Instalar App
        </Button>
      )}
    </header>
  )
}
```

### 7. Configuración de Next.js

Actualiza `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

## 🎨 Iconos Requeridos

Necesitas crear estos iconos en la carpeta `public/`:

- `icon-192.jpg` (192x192 píxeles)
- `icon-512.jpg` (512x512 píxeles)
- `favicon.ico`

## 📱 Criterios de Instalabilidad

Para que una PWA sea instalable, debe cumplir:

1. ✅ **HTTPS** - La app debe servirse sobre HTTPS
2. ✅ **Manifest** - Archivo `manifest.json` válido
3. ✅ **Service Worker** - Registrado y funcionando
4. ✅ **Iconos** - Al menos un icono de 192x192 y otro de 512x512
5. ✅ **Start URL** - URL de inicio válida

## 🔧 Estados del Hook

El hook `usePWAInstall` devuelve tres estados:

- `isInstallable`: `true` cuando la app puede ser instalada
- `isInstalled`: `true` cuando ya está instalada
- `installPWA()`: Función para iniciar la instalación

## 🚀 Uso en Componentes

### Método 1: Instalación Directa (Recomendado) ⚡

```typescript
import { usePWAInstall } from "@/hooks/use-pwa-install"

function MyComponent() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  return (
    <div>
      {/* Instalación con un solo clic - Sin handler intermedio */}
      {!isInstalled && isInstallable && (
        <button onClick={installPWA}>
          Instalar App
        </button>
      )}
      
      {isInstalled && (
        <p>¡App instalada!</p>
      )}
    </div>
  )
}
```

**✅ Ventajas de la instalación directa:**
- **Menos código**: No necesitas crear handlers adicionales
- **Más rápido**: La instalación se ejecuta inmediatamente
- **Mejor UX**: Un solo clic para instalar
- **Manejo automático**: El hook gestiona todos los estados

### Método 2: Con Handler Personalizado

```typescript
import { usePWAInstall } from "@/hooks/use-pwa-install"

function MyComponent() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  const handleInstall = async () => {
    // Aquí puedes agregar lógica adicional
    console.log("Iniciando instalación...")
    
    const installed = await installPWA()
    
    if (installed) {
      console.log("Instalación exitosa")
      // Lógica adicional post-instalación
    }
  }

  return (
    <div>
      {!isInstalled && isInstallable && (
        <button onClick={handleInstall}>
          Instalar App
        </button>
      )}
    </div>
  )
}
```

**📌 Usa un handler personalizado solo si necesitas:**
- Mostrar notificaciones personalizadas
- Registrar eventos de analíticas
- Ejecutar lógica adicional antes/después de la instalación

## 🐛 Solución de Problemas

### El botón de instalación no aparece
- Verificar que la app cumple los criterios de instalabilidad
- Revisar que el Service Worker esté registrado
- Comprobar que el manifest.json es válido

### Error al instalar
- Verificar que estás en HTTPS
- Comprobar la consola del navegador para errores
- Asegurar que los iconos existen y son accesibles

### La app no funciona offline
- Verificar que el Service Worker está cacheando los recursos correctos
- Revisar la configuración del cache en `sw.js`

## 📚 Recursos Adicionales

- [PWA Builder](https://www.pwabuilder.com/) - Herramienta para generar PWA
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse) - Auditoría de PWA
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) - Documentación oficial

## 🎯 Mejores Prácticas

1. **UX**: Muestra el botón de instalación solo cuando sea relevante
2. **Performance**: Optimiza el Service Worker para cachear recursos críticos
3. **Testing**: Prueba en diferentes navegadores y dispositivos
4. **Fallbacks**: Proporciona alternativas para navegadores que no soporten PWA

## 🔄 Comparación de Métodos de Instalación

### ⚡ Método Directo (Implementado en esta guía)

```typescript
// ✅ RECOMENDADO
<Button onClick={installPWA}>
  Instalar App
</Button>
```

**Ventajas:**
- ✅ Un solo clic
- ✅ Código mínimo
- ✅ Instalación inmediata
- ✅ Gestión automática de estados

### 🔄 Método con Handler Intermedio

```typescript
// ⚠️ Solo si necesitas lógica adicional
const handleInstall = async () => {
  // Lógica adicional aquí
  await installPWA()
}

<Button onClick={handleInstall}>
  Instalar App
</Button>
```

**Cuándo usar:**
- 📊 Necesitas analytics
- 🔔 Quieres mostrar notificaciones personalizadas
- 🎯 Tienes lógica de negocio adicional

### ❌ Método Manual (NO recomendado)

```typescript
// ❌ NO HACER ESTO
<Button onClick={() => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
      }
    })
  }
}}>
  Instalar App
</Button>
```

**Por qué evitarlo:**
- ❌ Mucho código repetitivo
- ❌ Propenso a errores
- ❌ No reutilizable
- ❌ Difícil de mantener

## 📊 Resumen: ¿Qué método usar?

| Escenario | Método Recomendado |
|-----------|-------------------|
| **Instalación simple** | `onClick={installPWA}` ⚡ |
| **Con analytics/logs** | Handler con `await installPWA()` 📊 |
| **Con notificaciones** | Handler con toast/feedback 🔔 |
| **PWA básica** | `onClick={installPWA}` ⚡ |
| **Múltiples botones** | `onClick={installPWA}` en todos ⚡ |

**Conclusión:** En el 90% de los casos, usa la instalación directa (`onClick={installPWA}`).

---

¡Con esta implementación tendrás una PWA completamente funcional con instalación directa en un solo clic! 📱✨⚡

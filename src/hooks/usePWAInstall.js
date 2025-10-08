import { useState, useEffect } from 'react'

export function usePWAInstall(onLog = null) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Función helper para logs
  const log = (message) => {
    console.log(message)
    if (onLog) onLog(message)
  }

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = window.navigator.standalone === true
    
    log('PWA: Checking installation status...')
    log(`PWA: - Display mode standalone: ${isStandalone}`)
    log(`PWA: - iOS standalone: ${isIosStandalone}`)
    
    if (isStandalone || isIosStandalone) {
      log('PWA: ✅ App is already installed')
      setIsInstalled(true)
      return
    }
    
    log('PWA: App not installed yet')

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      log('PWA: ✅ beforeinstallprompt event captured!')
      log('PWA: User interaction detected - install prompt available')
    }

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      log('PWA: ✅ App installed successfully')
    }

    // Función para detectar interacción del usuario
    const handleUserInteraction = () => {
      log('PWA: 👆 User interaction detected!')
      log('PWA: Chrome should now consider showing install prompt')
      
      // Remover listeners después de la primera interacción
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Escuchar interacciones del usuario (requerido por Chrome)
    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('scroll', handleUserInteraction, { once: true })
    document.addEventListener('keydown', handleUserInteraction, { once: true })
    
    log('PWA: 👂 Listening for user interaction...')
    log('PWA: Interact with the page to enable install prompt')

    // Mostrar el botón después de un delay (para que el usuario pueda interactuar)
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setIsInstallable(true)
        log('PWA: Install button enabled (user interaction required)')
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])

  const installPWA = async () => {
    log('PWA: installPWA() called')
    log(`PWA: - deferredPrompt available: ${!!deferredPrompt}`)
    log(`PWA: - isInstallable: ${isInstallable}`)
    log(`PWA: - isInstalled: ${isInstalled}`)
    
    // SI HAY deferredPrompt: usar el modal nativo
    if (deferredPrompt) {
      try {
        log('PWA: 📱 Showing native install prompt...')
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        log(`PWA: User choice: ${choiceResult.outcome}`)
        
        if (choiceResult.outcome === 'accepted') {
          log('PWA: ✅ Installation accepted!')
          setIsInstalled(true)
          setIsInstallable(false)
          setDeferredPrompt(null)
          return true
        }
        
        log('PWA: ❌ Installation dismissed by user')
        return false
      } catch (error) {
        log(`PWA: ❌ Installation error: ${error.message}`)
        return false
      }
    }

    // SI NO HAY deferredPrompt: mostrar nuestro modal personalizado
    log('PWA: ⚠️ No deferredPrompt - showing custom install modal')
    
    // Crear y mostrar nuestro modal de instalación
    return new Promise((resolve) => {
      // Crear el modal
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `
      
      modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
          <h2 style="margin: 0 0 16px 0; color: #333; font-size: 24px;">Instalar App</h2>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 16px; line-height: 1.5;">
            Instala <strong>Bolsa de Trabajo CCF</strong> para acceso rápido desde tu pantalla de inicio
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="install-cancel" style="
              background: #f5f5f5;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              color: #666;
            ">Cancelar</button>
            <button id="install-confirm" style="
              background: #1976d2;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              color: white;
              font-weight: 600;
            ">Instalar</button>
          </div>
        </div>
      `
      
      document.body.appendChild(modal)
      
      // Event listeners
      document.getElementById('install-cancel').onclick = () => {
        log('PWA: ❌ Custom modal - User cancelled')
        document.body.removeChild(modal)
        resolve(false)
      }
      
      document.getElementById('install-confirm').onclick = () => {
        log('PWA: ✅ Custom modal - User confirmed')
        document.body.removeChild(modal)
        
        // Mostrar instrucciones de instalación manual
        setTimeout(() => {
          alert(`📱 INSTRUCCIONES DE INSTALACIÓN:

1. Toca el menú ⋮ (3 puntos) en Chrome
2. Busca "Instalar app" o "Agregar a pantalla de inicio"
3. Toca "Instalar" o "Agregar"

O busca el icono ⬇️ en la barra de direcciones.

¡La app se instalará automáticamente!`)
        }, 300)
        
        resolve(true)
      }
      
      // Cerrar al tocar fuera del modal
      modal.onclick = (e) => {
        if (e.target === modal) {
          log('PWA: ❌ Custom modal - User cancelled (clicked outside)')
          document.body.removeChild(modal)
          resolve(false)
        }
      }
    })
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

import { useState, useEffect } from 'react'

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('PWA: beforeinstallprompt recibido')
    }

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('PWA: App instalada')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Para móviles: mostrar botón siempre (es el caso principal de uso)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // En móviles, mostrar el botón después de 2 segundos
      const timer = setTimeout(() => {
        if (!isInstallable && !isInstalled) {
          console.log('PWA: Mostrando botón para móvil')
          setIsInstallable(true)
        }
      }, 2000)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    // Para desktop, solo mostrar si hay deferredPrompt o en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        if (!isInstallable && !isInstalled) {
          console.log('PWA: Forzando botón de instalación en desarrollo')
          setIsInstallable(true)
        }
      }, 3000)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Para móviles sin deferredPrompt, mostrar instrucciones
    if (isMobile && !deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      let instructions = ''
      
      if (isIOS) {
        instructions = `
          <div style="text-align: left; font-size: 14px;">
            <p style="margin-bottom: 15px;"><strong>📱 Instalar en iPhone/iPad:</strong></p>
            <ol style="margin-left: 20px; line-height: 1.6;">
              <li>Toca el botón <strong>"Compartir"</strong> 📤 (cuadrado con flecha hacia arriba)</li>
              <li>Desplázate hacia abajo en el menú</li>
              <li>Toca <strong>"Agregar a pantalla de inicio"</strong> ➕</li>
              <li>Toca <strong>"Agregar"</strong> en la esquina superior derecha</li>
            </ol>
            <p style="margin-top: 15px; color: #666; font-size: 13px;">
              💡 La app aparecerá como un icono en tu pantalla de inicio
            </p>
          </div>
        `
      } else if (isAndroid) {
        instructions = `
          <div style="text-align: left; font-size: 14px;">
            <p style="margin-bottom: 15px;"><strong>🤖 Instalar en Android:</strong></p>
            <ol style="margin-left: 20px; line-height: 1.6;">
              <li>Toca el menú <strong>"⋮"</strong> (tres puntos) en tu navegador</li>
              <li>Busca <strong>"Agregar a pantalla de inicio"</strong> o <strong>"Instalar app"</strong></li>
              <li>Toca <strong>"Instalar"</strong> o <strong>"Agregar"</strong></li>
            </ol>
            <p style="margin-top: 10px; color: #666; font-size: 13px;">
              💡 También puedes buscar el icono de instalación ⬇️ en la barra de direcciones
            </p>
          </div>
        `
      }
      
      // Mostrar instrucciones
      const result = await Swal.fire({
        title: 'Instalar App',
        html: instructions,
        icon: 'info',
        confirmButtonText: 'Entendido'
      })
      
      return false
    }

    // Para desktop o cuando hay deferredPrompt
    if (deferredPrompt) {
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

    return false
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

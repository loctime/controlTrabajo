import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

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

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    // SI HAY deferredPrompt: instalar DIRECTAMENTE (es el caso ideal)
    if (deferredPrompt) {
      try {
        console.log('PWA: ✅ Instalando directamente con prompt del navegador')
        // Mostrar el prompt NATIVO del navegador
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true)
          setIsInstallable(false)
          setDeferredPrompt(null)
          console.log('PWA: ✅ Instalación exitosa')
          
          // Mostrar confirmación
          await Swal.fire({
            title: '¡Instalado!',
            text: 'La app se ha instalado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })
          
          return true
        }
        console.log('PWA: Usuario canceló la instalación')
        return false
      } catch (error) {
        console.error('Error installing PWA:', error)
        return false
      }
    }

    // Si NO HAY deferredPrompt: no podemos forzar instalación
    // Esto solo pasa en iOS o navegadores que no soportan PWA install prompt
    console.log('PWA: ⚠️ No hay deferredPrompt disponible')
    console.log('PWA: El usuario debe instalar manualmente desde el navegador')
    
    return false
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

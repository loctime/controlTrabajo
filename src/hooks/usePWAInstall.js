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

    // SIEMPRE mostrar el botón (excepto si ya está instalado)
    setTimeout(() => {
      if (!isInstalled) {
        setIsInstallable(true)
        console.log('PWA: Botón de instalación visible')
      }
    }, 500)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    console.log('PWA: Intentando instalar...')
    
    // SI HAY deferredPrompt: instalar con el prompt del navegador
    if (deferredPrompt) {
      try {
        console.log('PWA: Mostrando prompt de instalación')
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA: ¡Instalado!')
          setIsInstalled(true)
          setIsInstallable(false)
          setDeferredPrompt(null)
          return true
        }
        return false
      } catch (error) {
        console.error('PWA: Error al instalar:', error)
        return false
      }
    }

    // Si NO HAY deferredPrompt: mostrar alerta simple
    console.log('PWA: Sin prompt disponible, mostrando alerta')
    await Swal.fire({
      title: 'Instalar App',
      text: 'Usa el menú de tu navegador para instalar la app',
      icon: 'info',
      confirmButtonText: 'OK'
    })
    
    return false
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

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
      console.log('PWA: beforeinstallprompt event captured')
    }

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('PWA: App installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // FORZAR que el botón aparezca siempre (excepto si ya está instalado)
    // Esto permite que el botón se vea incluso sin beforeinstallprompt
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setIsInstallable(true)
        console.log('PWA: Install button force-enabled')
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No prompt available yet')
      return false
    }

    try {
      console.log('PWA: Showing install prompt')
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: Installation accepted')
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      console.log('PWA: Installation dismissed')
      return false
    } catch (error) {
      console.error('PWA: Installation error:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

import { useState, useEffect } from 'react'

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = window.navigator.standalone === true
    
    if (isStandalone || isIosStandalone) {
      setIsInstalled(true)
      return
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('PWA: ✅ Evento beforeinstallprompt capturado')
    }

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('PWA: ✅ App instalada correctamente')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('PWA: ⚠️ No hay prompt disponible aún')
      return false
    }

    try {
      console.log('PWA: 📱 Mostrando prompt de instalación...')
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      console.log(`PWA: Respuesta del usuario: ${choiceResult.outcome}`)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: ✅ Instalación aceptada!')
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      console.log('PWA: ❌ Instalación rechazada por el usuario')
      return false
    } catch (error) {
      console.error('PWA: ❌ Error al instalar:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

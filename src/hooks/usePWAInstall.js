import { useState, useEffect } from 'react'

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = window.navigator.standalone === true
    
    console.log('PWA: Checking installation status...')
    console.log('PWA: - Display mode standalone:', isStandalone)
    console.log('PWA: - iOS standalone:', isIosStandalone)
    
    if (isStandalone || isIosStandalone) {
      console.log('PWA: ✅ App is already installed')
      setIsInstalled(true)
      return
    }
    
    console.log('PWA: App not installed yet')

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
    console.log('PWA: installPWA() called')
    console.log('PWA: - deferredPrompt available:', !!deferredPrompt)
    console.log('PWA: - isInstallable:', isInstallable)
    console.log('PWA: - isInstalled:', isInstalled)
    
    if (!deferredPrompt) {
      console.warn('PWA: ⚠️ Cannot install - no deferredPrompt available')
      console.log('PWA: This usually means:')
      console.log('  1. App is already installed')
      console.log('  2. Browser does not support PWA install prompt (iOS Safari)')
      console.log('  3. Page does not meet PWA criteria')
      return false
    }

    try {
      console.log('PWA: 📱 Showing native install prompt...')
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      console.log('PWA: User choice:', choiceResult.outcome)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: ✅ Installation accepted!')
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      console.log('PWA: ❌ Installation dismissed by user')
      return false
    } catch (error) {
      console.error('PWA: ❌ Installation error:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

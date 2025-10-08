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
      log('PWA: beforeinstallprompt event captured')
    }

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      log('PWA: App installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // FORZAR que el botón aparezca siempre (excepto si ya está instalado)
    // Esto permite que el botón se vea incluso sin beforeinstallprompt
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setIsInstallable(true)
        log('PWA: Install button force-enabled')
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    log('PWA: installPWA() called')
    log(`PWA: - deferredPrompt available: ${!!deferredPrompt}`)
    log(`PWA: - isInstallable: ${isInstallable}`)
    log(`PWA: - isInstalled: ${isInstalled}`)
    
    if (!deferredPrompt) {
      log('PWA: ⚠️ Cannot install - no deferredPrompt available')
      log('PWA: This usually means:')
      log('  1. App is already installed')
      log('  2. Browser does not support PWA install prompt (iOS Safari)')
      log('  3. Page does not meet PWA criteria')
      return false
    }

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

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}

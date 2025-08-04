'use client'

import { useEffect } from 'react'

export default function BrowserAuthInitializer() {
  useEffect(() => {
    // Dynamically import browser auth fix to ensure it only runs on client
    import('@/lib/utils/browser-auth-fix').then(() => {
      // Browser auth fix will auto-initialize
    }).catch((error) => {
      console.warn('Failed to load browser auth fix:', error)
    })
  }, [])

  return null // This component doesn't render anything
}
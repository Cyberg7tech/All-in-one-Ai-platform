'use client'

import { useEffect } from 'react'

export default function BrowserAuthInitializer() {
  useEffect(() => {
    // DISABLED: Browser auth fix causing infinite loops
    // import('@/lib/utils/browser-auth-fix').then(() => {
    //   // Browser auth fix will auto-initialize
    // }).catch((error) => {
    //   console.warn('Failed to load browser auth fix:', error)
    // })
  }, [])

  return null // This component doesn't render anything
}
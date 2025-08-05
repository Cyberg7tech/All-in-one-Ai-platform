'use client'

import { useEffect, useState } from 'react'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch by only rendering after client-side mount
  if (!isClient) {
    return null
  }

  return <>{children}</>
}
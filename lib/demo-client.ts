'use client'

import { useEffect, useState } from 'react'
import { isDemo } from '@/lib/demo'

let cachedRuntimeDemo: boolean | null = null
let pendingRuntimeDemo: Promise<boolean> | null = null

async function detectRuntimeDemo() {
  if (isDemo()) return true
  if (cachedRuntimeDemo !== null) return cachedRuntimeDemo

  if (!pendingRuntimeDemo) {
    pendingRuntimeDemo = fetch('/api/system/health', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) return false
        const data = await response.json()
        return data?.mode === 'demo' || data?.checks?.databaseUrl === false
      })
      .catch(() => false)
      .then(value => {
        cachedRuntimeDemo = value
        return value
      })
      .finally(() => {
        pendingRuntimeDemo = null
      })
  }

  return pendingRuntimeDemo
}

export function useRuntimeDemo() {
  const [runtimeDemo, setRuntimeDemo] = useState(() => isDemo() || cachedRuntimeDemo === true)

  useEffect(() => {
    let active = true
    detectRuntimeDemo().then(value => {
      if (active) setRuntimeDemo(value)
    })
    return () => {
      active = false
    }
  }, [])

  return runtimeDemo
}

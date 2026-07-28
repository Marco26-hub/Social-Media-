'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import styles from './theme-toggle.module.css'

type Theme = 'light' | 'dark'

type ThemeToggleProps = {
  showLabel?: boolean
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  window.localStorage.setItem('swa-theme', theme)
  window.dispatchEvent(new CustomEvent<Theme>('swa-theme-change', { detail: theme }))
}

export default function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    setTheme(currentTheme)

    const syncTheme = (event: Event) => {
      setTheme((event as CustomEvent<Theme>).detail)
    }

    window.addEventListener('swa-theme-change', syncTheme)
    return () => window.removeEventListener('swa-theme-change', syncTheme)
  }, [])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const label = theme === 'dark' ? 'Usa sfondo chiaro' : 'Usa sfondo notte'

  return (
    <button
      type="button"
      className={`${styles.toggle} ${showLabel ? styles.withLabel : ''}`}
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(nextTheme)
        setTheme(nextTheme)
      }}
    >
      {theme === 'dark'
        ? <Sun size={17} strokeWidth={1.9} aria-hidden="true" />
        : <Moon size={17} strokeWidth={1.9} aria-hidden="true" />}
      {showLabel && <span>{theme === 'dark' ? 'Sfondo chiaro' : 'Sfondo notte'}</span>}
    </button>
  )
}

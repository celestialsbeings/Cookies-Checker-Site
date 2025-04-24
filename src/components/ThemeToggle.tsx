import { useEffect } from 'react'
import { useThemeStore, applyTheme } from '../utils/theme'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore()

  useEffect(() => {
    applyTheme(isDark)
  }, [isDark])

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-purple-600 dark:bg-purple-500 
                text-white shadow-lg hover:scale-110 transform transition-all duration-300
                hardware-accelerated theme-transition"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="w-6 h-6" />
      ) : (
        <MoonIcon className="w-6 h-6" />
      )}
    </button>
  )
}

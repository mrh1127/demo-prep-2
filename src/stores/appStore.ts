import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/types'

interface AppState {
  language: Language
  isLargeText: boolean
  isHighContrast: boolean
  isReducedMotion: boolean
  setLanguage: (lang: Language) => void
  setLargeText: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setReducedMotion: (enabled: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      isLargeText: false,
      isHighContrast: false,
      isReducedMotion: false,

      setLanguage: (lang: Language) => set({ language: lang }),
      setLargeText: (enabled: boolean) => set({ isLargeText: enabled }),
      setHighContrast: (enabled: boolean) => set({ isHighContrast: enabled }),
      setReducedMotion: (enabled: boolean) => set({ isReducedMotion: enabled }),
    }),
    {
      name: 'app-settings',
    }
  )
)

import { useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/lib/i18n'

export function useTranslation() {
  const language = useAppStore((state) => state.language)

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let translation = getTranslation(language, key)

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          translation = translation.replace(`{${k}}`, String(v))
        })
      }

      return translation
    },
    [language]
  )

  return { t, language }
}

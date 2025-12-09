import { Globe, Eye, Volume2, Move, Type, Contrast, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppStore } from '@/stores/appStore'
import { languageNames, supportedLanguages } from '@/lib/i18n'
import type { Language } from '@/types'

export function SettingsPage() {
  const { t } = useTranslation()
  const {
    language,
    isLargeText,
    isHighContrast,
    isReducedMotion,
    setLanguage,
    setLargeText,
    setHighContrast,
    setReducedMotion,
  } = useAppStore()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/profile"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Language
        </h2>
        <div className="card divide-y divide-gray-100">
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang as Language)}
              className={`w-full p-4 flex items-center justify-between transition-colors ${
                language === lang ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-gray-900">
                {languageNames[lang as Language]}
              </span>
              {language === lang && (
                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          {t('accessibility.settings')}
        </h2>
        <div className="card divide-y divide-gray-100">
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{t('accessibility.largeText')}</p>
                <p className="text-sm text-gray-500">Increase text size throughout the app</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isLargeText}
              onChange={(e) => setLargeText(e.target.checked)}
              className="w-6 h-6 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{t('accessibility.highContrast')}</p>
                <p className="text-sm text-gray-500">Increase color contrast for better visibility</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isHighContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-6 h-6 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Move className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Reduce Motion</p>
                <p className="text-sm text-gray-500">Minimize animations and transitions</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isReducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-6 h-6 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>

          <div className="p-4">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{t('accessibility.screenReader')}</p>
                <p className="text-sm text-gray-500">
                  This app is optimized for screen readers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>ParkEasy v1.0.0</p>
        <p className="mt-1">Theme Park Parking Made Easy</p>
      </div>
    </div>
  )
}

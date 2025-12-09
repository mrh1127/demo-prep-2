import { Menu, X, Globe, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { languageNames, supportedLanguages } from '@/lib/i18n'
import type { Language } from '@/types'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const { t } = useTranslation()
  const location = useLocation()
  const { user, signOut } = useAuthStore()
  const { language, setLanguage } = useAppStore()

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/parking', label: t('nav.parking') },
    { path: '/find-car', label: t('nav.findCar') },
    { path: '/history', label: t('nav.history') },
    { path: '/profile', label: t('nav.profile') },
  ]

  return (
    <header className="bg-white border-b border-gray-100 safe-top sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-semibold text-xl text-gray-900 hidden sm:block">ParkEasy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              {isLangOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as Language)
                          setIsLangOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          language === lang
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {languageNames[lang as Language]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {user && (
              <Link
                to="/settings"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col gap-1">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-3 rounded-lg text-base font-medium text-error-600 hover:bg-error-50 text-left transition-colors"
                  >
                    {t('auth.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t('auth.signIn')}
                  </Link>
                  <Link
                    to="/auth/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-medium bg-primary-500 text-white hover:bg-primary-600 text-center transition-colors"
                  >
                    {t('auth.signUp')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

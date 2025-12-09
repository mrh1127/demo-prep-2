import { Home, Car, MapPin, Clock, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'

export function BottomNav() {
  const location = useLocation()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  if (!user) return null

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/parking', icon: Car, label: t('nav.parking') },
    { path: '/find-car', icon: MapPin, label: t('nav.findCar') },
    { path: '/history', icon: Clock, label: t('nav.history') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom md:hidden z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

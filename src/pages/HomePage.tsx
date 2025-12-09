import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, MapPin, Clock, ChevronRight, Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { useParkingStore } from '@/stores/parkingStore'
import { useLocationStore } from '@/stores/locationStore'
import { ActiveSession } from '@/components/parking/ActiveSession'
import { Loading } from '@/components/common/Loading'

export function HomePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const { activeSessions, parkingLots, fetchActiveSessions, fetchParkingLots, isLoading } = useParkingStore()
  const { savedLocation, fetchSavedLocation } = useLocationStore()

  useEffect(() => {
    fetchActiveSessions()
    fetchParkingLots()
    fetchSavedLocation()
  }, [fetchActiveSessions, fetchParkingLots, fetchSavedLocation])

  if (isLoading && activeSessions.length === 0) {
    return <Loading fullScreen />
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">Ready for your visit?</p>
      </div>

      {activeSessions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            {t('parking.activeSession')}
          </h2>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <ActiveSession key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 mb-8">
        <Link
          to="/parking"
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <Car className="w-7 h-7 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{t('nav.parking')}</h3>
            <p className="text-sm text-gray-500">
              {parkingLots.length} lots available
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>

        <Link
          to="/find-car"
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
            <MapPin className="w-7 h-7 text-secondary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{t('nav.findCar')}</h3>
            <p className="text-sm text-gray-500">
              {savedLocation ? 'Location saved' : 'Save your car location'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>

        <Link
          to="/history"
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center group-hover:bg-accent-200 transition-colors">
            <Clock className="w-7 h-7 text-accent-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{t('nav.history')}</h3>
            <p className="text-sm text-gray-500">View past parking sessions</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>
      </section>

      {parkingLots.length > 0 && !activeSessions.length && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Start
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {parkingLots.slice(0, 4).map((lot) => (
              <Link
                key={lot.id}
                to={`/parking?lot=${lot.id}`}
                className="card p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {lot.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lot.available_spots} {t('parking.available')}
                </p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success-500 rounded-full transition-all"
                    style={{
                      width: `${(lot.available_spots / lot.total_capacity) * 100}%`,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

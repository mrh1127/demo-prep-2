import { useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useParkingStore } from '@/stores/parkingStore'
import { useLocationStore } from '@/stores/locationStore'
import { CarLocationMap } from '@/components/findcar/CarLocationMap'
import { LocationSaver } from '@/components/findcar/LocationSaver'

export function FindCarPage() {
  const { t } = useTranslation()
  const { fetchActiveSessions, fetchParkingLots } = useParkingStore()
  const { fetchSavedLocation, getCurrentPosition, startWatchingPosition } = useLocationStore()

  useEffect(() => {
    fetchActiveSessions()
    fetchParkingLots()
    fetchSavedLocation()
    getCurrentPosition()
    startWatchingPosition()
  }, [fetchActiveSessions, fetchParkingLots, fetchSavedLocation, getCurrentPosition, startWatchingPosition])

  return (
    <div className="h-[calc(100vh-64px-80px)] md:h-[calc(100vh-64px)] flex flex-col">
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">{t('findCar.title')}</h1>
      </div>

      <div className="flex-1 relative">
        <CarLocationMap />
      </div>

      <div className="p-4 bg-gray-50">
        <LocationSaver />
      </div>
    </div>
  )
}

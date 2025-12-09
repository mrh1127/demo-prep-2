import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { Navigation, MapPin, Car, Locate, WifiOff } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocationStore } from '@/stores/locationStore'

const userIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3399FF" width="32" height="32">
      <circle cx="12" cy="12" r="8" fill="#3399FF" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const carIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" width="40" height="40">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

function MapController({ userPosition, carPosition }: {
  userPosition: [number, number] | null
  carPosition: [number, number] | null
}) {
  const map = useMap()

  useEffect(() => {
    if (userPosition && carPosition) {
      const bounds = new LatLngBounds([userPosition, carPosition])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (userPosition) {
      map.setView(userPosition, 17)
    } else if (carPosition) {
      map.setView(carPosition, 17)
    }
  }, [map, userPosition, carPosition])

  return null
}

export function CarLocationMap() {
  const { t } = useTranslation()
  const {
    savedLocation,
    currentPosition,
    isWatching,
    fetchSavedLocation,
    getCurrentPosition,
    startWatchingPosition,
    stopWatchingPosition,
  } = useLocationStore()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [distance, setDistance] = useState<number | null>(null)
  const [walkingTime, setWalkingTime] = useState<number | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    fetchSavedLocation()
    getCurrentPosition()
    startWatchingPosition()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      stopWatchingPosition()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchSavedLocation, getCurrentPosition, startWatchingPosition, stopWatchingPosition])

  useEffect(() => {
    if (currentPosition && savedLocation) {
      const R = 6371e3
      const lat1 = (currentPosition.latitude * Math.PI) / 180
      const lat2 = (savedLocation.latitude * Math.PI) / 180
      const deltaLat = ((savedLocation.latitude - currentPosition.latitude) * Math.PI) / 180
      const deltaLng = ((savedLocation.longitude - currentPosition.longitude) * Math.PI) / 180

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c

      setDistance(Math.round(d))
      setWalkingTime(Math.round(d / 80))
    }
  }, [currentPosition, savedLocation])

  const userPosition: [number, number] | null = currentPosition
    ? [currentPosition.latitude, currentPosition.longitude]
    : null

  const carPosition: [number, number] | null = savedLocation
    ? [savedLocation.latitude, savedLocation.longitude]
    : null

  const defaultCenter: [number, number] = [28.4177, -81.5812]

  const handleCenterOnUser = () => {
    if (userPosition && mapRef.current) {
      mapRef.current.setView(userPosition, 17)
    }
  }

  const handleNavigate = () => {
    if (savedLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${savedLocation.latitude},${savedLocation.longitude}&travelmode=walking`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="relative h-full">
      {!isOnline && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-warning-100 text-warning-800 px-4 py-2 rounded-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">{t('findCar.offlineMode')}</span>
        </div>
      )}

      <MapContainer
        center={carPosition || userPosition || defaultCenter}
        zoom={16}
        className="h-full w-full rounded-2xl"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController userPosition={userPosition} carPosition={carPosition} />

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">{t('findCar.currentLocation')}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {carPosition && (
          <Marker position={carPosition} icon={carIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-gray-900">{t('findCar.savedLocation')}</p>
                {savedLocation?.section && (
                  <p className="text-sm text-gray-600 mt-1">
                    {t('parking.section')}: {savedLocation.section.name}
                  </p>
                )}
                {savedLocation?.notes && (
                  <p className="text-sm text-gray-500 mt-1">{savedLocation.notes}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {userPosition && carPosition && (
          <Polyline
            positions={[userPosition, carPosition]}
            color="#3399FF"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>

      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleCenterOnUser}
          className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Center on my location"
        >
          <Locate className={`w-5 h-5 ${isWatching ? 'text-primary-500' : 'text-gray-600'}`} />
        </button>
      </div>

      {savedLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-error-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {savedLocation.parking_lot?.name || t('findCar.savedLocation')}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  {distance !== null && (
                    <span className="text-sm text-gray-500">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {distance < 1000
                        ? `${distance}m`
                        : `${(distance / 1000).toFixed(1)}km`}
                    </span>
                  )}
                  {walkingTime !== null && (
                    <span className="text-sm text-gray-500">
                      ~{walkingTime} min walk
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleNavigate}
                className="btn btn-primary"
              >
                <Navigation className="w-4 h-4" />
                {t('findCar.getDirections')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

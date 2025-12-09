import { useState } from 'react'
import { MapPin, Camera, FileText, Loader2, Check, Trash2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocationStore } from '@/stores/locationStore'
import { useParkingStore } from '@/stores/parkingStore'

export function LocationSaver() {
  const { t } = useTranslation()
  const {
    savedLocation,
    currentPosition,
    isLoading,
    saveLocation,
    deleteLocation,
    getCurrentPosition,
  } = useLocationStore()
  const { activeSessions } = useParkingStore()

  const [notes, setNotes] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  const activeSession = activeSessions[0]

  const handleSaveLocation = async () => {
    const position = currentPosition || (await getCurrentPosition())
    if (!position) return

    const section = activeSession?.parking_spot?.section
    const lot = section?.parking_lot

    await saveLocation({
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy,
      altitude: position.altitude,
      heading: position.heading,
      parkingSessionId: activeSession?.id,
      parkingLotId: lot?.id,
      sectionId: section?.id,
      notes: notes || undefined,
    })

    setNotes('')
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)
  }

  const handleDelete = async () => {
    if (savedLocation && confirm('Delete saved location?')) {
      await deleteLocation(savedLocation.id)
    }
  }

  if (savedLocation) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('findCar.locationSaved')}</h3>
              <p className="text-sm text-gray-500">
                {savedLocation.parking_lot?.name || 'Location saved'}
                {savedLocation.section && ` - ${savedLocation.section.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-error-600 transition-colors"
            aria-label="Delete saved location"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        {savedLocation.notes && (
          <p className="text-sm text-gray-600 mt-3 pl-15">
            {savedLocation.notes}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{t('findCar.saveLocation')}</h3>
          <p className="text-sm text-gray-500">{t('findCar.saveNow')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">{t('findCar.addNotes')}</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Row 5, near the red column..."
              className="input pl-11 min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveLocation}
            disabled={isLoading || !currentPosition}
            className="btn btn-primary flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showSaved ? (
              <>
                <Check className="w-5 h-5" />
                {t('findCar.locationSaved')}
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                {t('findCar.saveLocation')}
              </>
            )}
          </button>
          <button className="btn btn-secondary" disabled>
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {!currentPosition && (
          <p className="text-sm text-warning-600 text-center">
            Waiting for GPS signal...
          </p>
        )}
      </div>
    </div>
  )
}

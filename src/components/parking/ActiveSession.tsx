import { useState, useEffect } from 'react'
import { Clock, MapPin, Car, QrCode, Plus, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useParkingStore } from '@/stores/parkingStore'
import { Modal } from '@/components/common/Modal'
import QRCode from 'qrcode'
import { formatDistanceToNow, differenceInMinutes, isPast } from 'date-fns'
import type { ParkingSession } from '@/types'

interface ActiveSessionProps {
  session: ParkingSession
}

export function ActiveSession({ session }: ActiveSessionProps) {
  const { t } = useTranslation()
  const { extendSession, endSession, isLoading } = useParkingStore()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const expiresAt = new Date(session.expires_at)
      const expired = isPast(expiresAt)
      setIsExpired(expired)

      if (expired) {
        setTimeLeft(t('parking.expired'))
      } else {
        const minutes = differenceInMinutes(expiresAt, new Date())
        if (minutes < 60) {
          setTimeLeft(`${minutes} ${t('parking.minutes')}`)
        } else {
          setTimeLeft(formatDistanceToNow(expiresAt))
        }
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [session.expires_at, t])

  useEffect(() => {
    if (session.qr_code) {
      QRCode.toDataURL(session.qr_code, {
        width: 200,
        margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' },
      }).then(setQrCodeUrl)
    }
  }, [session.qr_code])

  const handleExtend = async (hours: number) => {
    await extendSession(session.id, hours)
    setShowExtendModal(false)
  }

  const handleEnd = async () => {
    if (confirm('Are you sure you want to end this parking session?')) {
      await endSession(session.id)
    }
  }

  const section = session.parking_spot?.section
  const lot = section?.parking_lot

  return (
    <>
      <div className={`card p-5 ${isExpired ? 'border-2 border-error-300' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`badge ${
                  isExpired ? 'badge-error' : 'badge-success'
                }`}
              >
                {isExpired ? t('parking.expired') : t('parking.activeSession')}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mt-2">
              {lot?.name || 'Parking Session'}
            </h3>
          </div>
          <button
            onClick={() => setShowQrModal(true)}
            className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            aria-label="Show QR code"
          >
            <QrCode className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {section && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {t('parking.section')} {section.name}
                {section.level > 0 && `, ${t('parking.level')} ${section.level}`}
              </span>
            </div>
          )}
          {session.vehicle && (
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {session.vehicle.license_plate}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span
              className={`text-sm font-medium ${
                isExpired ? 'text-error-600' : 'text-gray-600'
              }`}
            >
              {t('parking.expiresIn')} {timeLeft}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {t('parking.total')}: ${session.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setShowExtendModal(true)}
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            <Plus className="w-4 h-4" />
            {t('parking.extendParking')}
          </button>
          <button
            onClick={handleEnd}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            <X className="w-4 h-4" />
            {t('parking.endSession')}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Parking QR Code"
        size="sm"
      >
        <div className="flex flex-col items-center">
          {qrCodeUrl && (
            <img src={qrCodeUrl} alt="Parking QR Code" className="w-48 h-48" />
          )}
          <p className="text-center text-sm text-gray-600 mt-4">
            Show this QR code when exiting the parking area
          </p>
          <p className="text-center font-mono text-sm text-gray-500 mt-2">
            {session.qr_code}
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        title={t('parking.extendParking')}
        size="sm"
      >
        <div className="space-y-3">
          {[1, 2, 3, 4].map((hours) => (
            <button
              key={hours}
              onClick={() => handleExtend(hours)}
              disabled={isLoading}
              className="w-full p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-between"
            >
              <span className="font-medium">
                {hours} {t('parking.hours')}
              </span>
              <span className="text-primary-600 font-semibold">
                +${((session.pricing_tier?.price_per_hour || 5) * hours).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

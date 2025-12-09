import { Car, Zap, Umbrella, Train, Bath, Accessibility } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { ParkingLot, PricingTier } from '@/types'

interface ParkingLotCardProps {
  lot: ParkingLot
  onSelect: (lot: ParkingLot) => void
}

const amenityIcons: Record<string, typeof Car> = {
  ev_charging: Zap,
  covered_parking: Umbrella,
  tram_service: Train,
  restrooms: Bath,
  accessible: Accessibility,
}

export function ParkingLotCard({ lot, onSelect }: ParkingLotCardProps) {
  const { t } = useTranslation()

  const availabilityPercent = lot.total_capacity > 0
    ? (lot.available_spots / lot.total_capacity) * 100
    : 0

  const getAvailabilityColor = () => {
    if (availabilityPercent > 50) return 'bg-success-500'
    if (availabilityPercent > 20) return 'bg-warning-500'
    return 'bg-error-500'
  }

  const lowestPrice = lot.pricing_tiers?.reduce(
    (min: number, tier: PricingTier) => Math.min(min, tier.price_per_hour),
    Infinity
  ) || 0

  return (
    <button
      onClick={() => onSelect(lot)}
      className="card p-4 w-full text-left hover:shadow-md transition-all group"
    >
      <div className="flex gap-4">
        {lot.image_url && (
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src={lot.image_url}
              alt={lot.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{lot.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lot.description}</p>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getAvailabilityColor()}`} />
              <span className="text-sm font-medium text-gray-700">
                {lot.available_spots} {t('parking.available')}
              </span>
            </div>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm font-semibold text-primary-600">
              ${lowestPrice.toFixed(2)}{t('parking.perHour')}
            </span>
          </div>

          {lot.amenities && lot.amenities.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {lot.amenities.slice(0, 4).map((amenity) => {
                const Icon = amenityIcons[amenity] || Car
                return (
                  <div
                    key={amenity}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"
                    title={t(`parking.${amenity}`)}
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useParkingStore } from '@/stores/parkingStore'
import { ParkingLotCard } from '@/components/parking/ParkingLotCard'
import { PurchaseModal } from '@/components/parking/PurchaseModal'
import { ActiveSession } from '@/components/parking/ActiveSession'
import { Loading } from '@/components/common/Loading'
import type { ParkingLot } from '@/types'

export function ParkingPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { parkingLots, activeSessions, fetchParkingLots, fetchActiveSessions, isLoading } = useParkingStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  useEffect(() => {
    fetchParkingLots()
    fetchActiveSessions()
  }, [fetchParkingLots, fetchActiveSessions])

  useEffect(() => {
    const lotId = searchParams.get('lot')
    if (lotId && parkingLots.length > 0) {
      const lot = parkingLots.find((l) => l.id === lotId)
      if (lot) {
        setSelectedLot(lot)
        setShowPurchaseModal(true)
      }
    }
  }, [searchParams, parkingLots])

  const filteredLots = parkingLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot)
    setShowPurchaseModal(true)
  }

  if (isLoading && parkingLots.length === 0) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.parking')}</h1>
        <p className="text-gray-500 mt-1">{t('parking.selectLot')}</p>
      </div>

      {activeSessions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {t('parking.activeSession')}
          </h2>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <ActiveSession key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="input pl-12"
          />
        </div>
        <button className="btn btn-secondary">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button className="badge badge-primary whitespace-nowrap">All</button>
        <button className="badge bg-gray-100 text-gray-600 whitespace-nowrap">
          Available Now
        </button>
        <button className="badge bg-gray-100 text-gray-600 whitespace-nowrap">
          Covered
        </button>
        <button className="badge bg-gray-100 text-gray-600 whitespace-nowrap">
          EV Charging
        </button>
      </div>

      <div className="space-y-4">
        {filteredLots.length > 0 ? (
          filteredLots.map((lot) => (
            <ParkingLotCard key={lot.id} lot={lot} onSelect={handleSelectLot} />
          ))
        ) : (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No parking lots found</p>
          </div>
        )}
      </div>

      {selectedLot && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedLot(null)
          }}
          lot={selectedLot}
        />
      )}
    </div>
  )
}

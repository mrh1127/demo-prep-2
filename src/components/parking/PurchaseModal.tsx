import { useState, useEffect } from 'react'
import { CreditCard, Smartphone, Wallet, Clock, Car, ChevronRight, Loader2, Check } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useParkingStore } from '@/stores/parkingStore'
import { Modal } from '@/components/common/Modal'
import type { ParkingLot, PricingTier, Vehicle, PaymentMethod } from '@/types'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  lot: ParkingLot
}

type Step = 'duration' | 'vehicle' | 'payment' | 'processing' | 'success'

const paymentMethods: { id: PaymentMethod; icon: typeof CreditCard; label: string }[] = [
  { id: 'credit_card', icon: CreditCard, label: 'payment.creditCard' },
  { id: 'apple_pay', icon: Smartphone, label: 'payment.applePay' },
  { id: 'google_pay', icon: Wallet, label: 'payment.googlePay' },
  { id: 'park_pass', icon: Wallet, label: 'payment.parkPass' },
]

export function PurchaseModal({ isOpen, onClose, lot }: PurchaseModalProps) {
  const { t } = useTranslation()
  const { vehicles, fetchVehicles, createSession, isLoading } = useParkingStore()

  const [step, setStep] = useState<Step>('duration')
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [selectedHours, setSelectedHours] = useState(2)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [licensePlate, setLicensePlate] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit_card')

  useEffect(() => {
    if (isOpen) {
      fetchVehicles()
      setStep('duration')
      setSelectedHours(2)
      setSelectedVehicle(null)
      setLicensePlate('')
    }
  }, [isOpen, fetchVehicles])

  useEffect(() => {
    if (lot.pricing_tiers && lot.pricing_tiers.length > 0) {
      setSelectedTier(lot.pricing_tiers[0])
    }
  }, [lot])

  useEffect(() => {
    if (vehicles.length > 0) {
      const defaultVehicle = vehicles.find(v => v.is_default) || vehicles[0]
      setSelectedVehicle(defaultVehicle)
    }
  }, [vehicles])

  const totalAmount = selectedTier
    ? Math.min(
        selectedTier.price_per_hour * selectedHours,
        selectedTier.daily_max || Infinity
      )
    : 0

  const handlePurchase = async () => {
    if (!selectedTier) return

    setStep('processing')

    const { error } = await createSession({
      pricingTierId: selectedTier.id,
      durationHours: selectedHours,
      vehicleId: selectedVehicle?.id,
      licensePlate: !selectedVehicle ? licensePlate : undefined,
    })

    if (error) {
      setStep('payment')
    } else {
      setStep('success')
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  const renderDurationStep = () => (
    <div className="space-y-6">
      {lot.pricing_tiers && lot.pricing_tiers.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select Parking Type</h3>
          <div className="space-y-2">
            {lot.pricing_tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedTier?.id === tier.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{tier.name}</p>
                    <p className="text-sm text-gray-500">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      ${tier.price_per_hour.toFixed(2)}{t('parking.perHour')}
                    </p>
                    {tier.daily_max && (
                      <p className="text-xs text-gray-500">
                        {t('parking.dailyMax')}: ${tier.daily_max.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('parking.selectDuration')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 4, 8].map((hours) => (
            <button
              key={hours}
              onClick={() => setSelectedHours(hours)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedHours === hours
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">{hours}h</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={12}
            value={selectedHours}
            onChange={(e) => setSelectedHours(Number(e.target.value))}
            className="flex-1 accent-primary-500"
          />
          <span className="text-sm font-medium text-gray-700 w-16">
            {selectedHours} {t('parking.hours')}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{t('parking.total')}</span>
          <span className="text-2xl font-bold text-gray-900">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={() => setStep('vehicle')}
        className="btn btn-primary w-full"
      >
        {t('common.next')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )

  const renderVehicleStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Vehicle</h3>
        {vehicles.length > 0 ? (
          <div className="space-y-2">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => {
                  setSelectedVehicle(vehicle)
                  setLicensePlate('')
                }}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                    </p>
                    <p className="text-sm text-gray-500">{vehicle.license_plate}</p>
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={() => setSelectedVehicle(null)}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                !selectedVehicle
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-gray-600">Enter license plate manually</p>
            </button>
          </div>
        ) : null}

        {!selectedVehicle && (
          <div className="mt-4">
            <label className="label">{t('vehicle.licensePlate')}</label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              className="input"
              placeholder="ABC 1234"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep('duration')} className="btn btn-secondary flex-1">
          {t('common.back')}
        </button>
        <button
          onClick={() => setStep('payment')}
          disabled={!selectedVehicle && !licensePlate}
          className="btn btn-primary flex-1"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('payment.paymentMethod')}</h3>
        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedPayment === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{t(method.label)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{lot.name}</span>
          <span className="text-gray-900">{selectedHours}h</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Vehicle</span>
          <span className="text-gray-900">
            {selectedVehicle?.license_plate || licensePlate}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">{t('parking.total')}</span>
            <span className="font-bold text-xl text-gray-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep('vehicle')} className="btn btn-secondary flex-1">
          {t('common.back')}
        </button>
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="btn btn-primary flex-1"
        >
          {t('parking.payNow')}
        </button>
      </div>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center py-12">
      <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
      <p className="text-lg font-medium text-gray-900 mt-4">{t('payment.processing')}</p>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center py-12">
      <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
        <Check className="w-8 h-8 text-success-600" />
      </div>
      <p className="text-lg font-medium text-gray-900 mt-4">{t('payment.success')}</p>
      <p className="text-gray-500 mt-2 text-center">
        Your parking session has been started
      </p>
    </div>
  )

  const getTitle = () => {
    switch (step) {
      case 'duration':
        return t('parking.selectDuration')
      case 'vehicle':
        return 'Select Vehicle'
      case 'payment':
        return t('payment.paymentMethod')
      case 'processing':
        return t('payment.processing')
      case 'success':
        return t('payment.success')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      {step === 'duration' && renderDurationStep()}
      {step === 'vehicle' && renderVehicleStep()}
      {step === 'payment' && renderPaymentStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'success' && renderSuccessStep()}
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { User, Car, Plus, Trash2, Star, Edit2, LogOut, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { useParkingStore } from '@/stores/parkingStore'
import { Modal } from '@/components/common/Modal'
import type { Vehicle } from '@/types'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuthStore()
  const { vehicles, fetchVehicles, addVehicle, deleteVehicle, isLoading } = useParkingStore()

  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    license_plate: '',
    state_province: '',
    make: '',
    model: '',
    color: '',
    nickname: '',
    is_default: false,
  })

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    await addVehicle(newVehicle)
    setShowAddVehicle(false)
    setNewVehicle({
      license_plate: '',
      state_province: '',
      make: '',
      model: '',
      color: '',
      nickname: '',
      is_default: false,
    })
  }

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (confirm(`Delete ${vehicle.nickname || vehicle.license_plate}?`)) {
      await deleteVehicle(vehicle.id)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.profile')}</h1>
      </div>

      <section className="card p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-gray-900">
              {profile?.full_name || 'Guest'}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <Link
            to="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {profile?.park_pass_id && (
          <div className="mt-4 p-3 bg-primary-50 rounded-xl">
            <p className="text-sm text-primary-600 font-medium">
              Park Pass: {profile.park_pass_id}
            </p>
          </div>
        )}
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('vehicle.myVehicles')}
          </h2>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            {t('vehicle.addVehicle')}
          </button>
        </div>

        {vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="card p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                      </h3>
                      {vehicle.is_default && (
                        <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{vehicle.license_plate}</p>
                    {vehicle.color && (
                      <p className="text-sm text-gray-400">{vehicle.color}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle)}
                    className="p-2 text-gray-400 hover:text-error-600 transition-colors"
                    aria-label="Delete vehicle"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('vehicle.noVehicles')}</p>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="btn btn-primary mt-4"
            >
              <Plus className="w-4 h-4" />
              {t('vehicle.addVehicle')}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <Link
          to="/settings"
          className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">{t('accessibility.settings')}</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <button
          onClick={signOut}
          className="card p-4 w-full flex items-center gap-3 text-error-600 hover:bg-error-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('auth.signOut')}</span>
        </button>
      </section>

      <Modal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        title={t('vehicle.addVehicle')}
        size="md"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div>
            <label className="label">{t('vehicle.licensePlate')} *</label>
            <input
              type="text"
              value={newVehicle.license_plate}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, license_plate: e.target.value.toUpperCase() })
              }
              className="input"
              placeholder="ABC 1234"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('vehicle.make')}</label>
              <input
                type="text"
                value={newVehicle.make}
                onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                className="input"
                placeholder="Toyota"
              />
            </div>
            <div>
              <label className="label">{t('vehicle.model')}</label>
              <input
                type="text"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                className="input"
                placeholder="Camry"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('vehicle.color')}</label>
              <input
                type="text"
                value={newVehicle.color}
                onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                className="input"
                placeholder="Silver"
              />
            </div>
            <div>
              <label className="label">{t('vehicle.stateProvince')}</label>
              <input
                type="text"
                value={newVehicle.state_province}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, state_province: e.target.value })
                }
                className="input"
                placeholder="FL"
              />
            </div>
          </div>

          <div>
            <label className="label">{t('vehicle.nickname')}</label>
            <input
              type="text"
              value={newVehicle.nickname}
              onChange={(e) => setNewVehicle({ ...newVehicle, nickname: e.target.value })}
              className="input"
              placeholder="Family Car"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newVehicle.is_default}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, is_default: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-gray-700">{t('vehicle.setDefault')}</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddVehicle(false)}
              className="btn btn-secondary flex-1"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary flex-1">
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

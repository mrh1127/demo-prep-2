import { useEffect, useState } from 'react'
import { Clock, Car, MapPin, Receipt, ChevronRight, FileText } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/common/Loading'
import { Modal } from '@/components/common/Modal'
import { format } from 'date-fns'
import type { ParkingSession, Payment } from '@/types'

export function HistoryPage() {
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<ParkingSession[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<ParkingSession | null>(null)
  const [activeTab, setActiveTab] = useState<'sessions' | 'payments'>('sessions')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const { data: sessionsData } = await supabase
        .from('parking_sessions')
        .select(`
          *,
          vehicle:vehicles(*),
          pricing_tier:pricing_tiers(*),
          parking_spot:parking_spots(
            *,
            section:parking_sections(
              *,
              parking_lot:parking_lots(*)
            )
          )
        `)
        .in('session_status', ['completed', 'expired', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(50)

      if (sessionsData) {
        setSessions(sessionsData)
      }

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (paymentsData) {
        setPayments(paymentsData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success'
      case 'expired':
        return 'badge-warning'
      case 'cancelled':
        return 'badge-error'
      default:
        return 'badge-primary'
    }
  }

  if (isLoading) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.history')}</h1>
        <p className="text-gray-500 mt-1">View your past parking sessions</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
            activeTab === 'sessions'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
            activeTab === 'payments'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Receipt className="w-4 h-4 inline mr-2" />
          {t('payment.receipt')}s
        </button>
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const lot = session.parking_spot?.section?.parking_lot
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="card p-4 w-full text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${getStatusColor(session.session_status)}`}>
                          {session.session_status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(session.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-2">
                        {lot?.name || 'Parking Session'}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {session.vehicle && (
                          <span className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {session.vehicle.license_plate}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(session.started_at), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${session.total_amount.toFixed(2)}
                      </p>
                      <ChevronRight className="w-5 h-5 text-gray-400 mt-2" />
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No parking history yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`badge ${
                        payment.payment_status === 'completed'
                          ? 'badge-success'
                          : payment.payment_status === 'failed'
                          ? 'badge-error'
                          : 'badge-warning'
                      }`}
                    >
                      {payment.payment_status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      {payment.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  <p className="font-semibold text-lg text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payment history yet</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
        size="md"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className={`badge ${getStatusColor(selectedSession.session_status)}`}>
                {selectedSession.session_status}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${selectedSession.total_amount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {selectedSession.parking_spot?.section?.parking_lot?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedSession.vehicle && (
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-medium text-gray-900">
                      {selectedSession.vehicle.license_plate}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedSession.started_at), 'MMM d, h:mm a')} -{' '}
                    {selectedSession.ended_at
                      ? format(new Date(selectedSession.ended_at), 'h:mm a')
                      : 'Ongoing'}
                  </p>
                </div>
              </div>
            </div>

            {selectedSession.qr_code && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Session Code</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {selectedSession.qr_code}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

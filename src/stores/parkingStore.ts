import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { ParkingLot, ParkingSection, ParkingSession, PricingTier, Vehicle } from '@/types'

interface ParkingState {
  parkingLots: ParkingLot[]
  selectedLot: ParkingLot | null
  selectedSection: ParkingSection | null
  activeSessions: ParkingSession[]
  vehicles: Vehicle[]
  isLoading: boolean
  error: string | null
  fetchParkingLots: () => Promise<void>
  fetchLotDetails: (lotId: string) => Promise<void>
  fetchActiveSessions: () => Promise<void>
  fetchVehicles: () => Promise<void>
  createSession: (params: CreateSessionParams) => Promise<{ error: Error | null; session?: ParkingSession }>
  extendSession: (sessionId: string, additionalHours: number) => Promise<{ error: Error | null }>
  endSession: (sessionId: string) => Promise<{ error: Error | null }>
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: Error | null }>
  deleteVehicle: (vehicleId: string) => Promise<{ error: Error | null }>
  setSelectedLot: (lot: ParkingLot | null) => void
  setSelectedSection: (section: ParkingSection | null) => void
}

interface CreateSessionParams {
  vehicleId?: string
  licensePlate?: string
  pricingTierId: string
  durationHours: number
  sectionId?: string
}

export const useParkingStore = create<ParkingState>((set, get) => ({
  parkingLots: [],
  selectedLot: null,
  selectedSection: null,
  activeSessions: [],
  vehicles: [],
  isLoading: false,
  error: null,

  fetchParkingLots: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .select(`
          *,
          sections:parking_sections(*),
          pricing_tiers(*)
        `)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      set({ parkingLots: data || [] })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchLotDetails: async (lotId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .select(`
          *,
          sections:parking_sections(*),
          pricing_tiers(*)
        `)
        .eq('id', lotId)
        .maybeSingle()

      if (error) throw error
      if (data) {
        set({ selectedLot: data })
      }
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchActiveSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
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
        .eq('session_status', 'active')
        .order('started_at', { ascending: false })

      if (error) throw error
      set({ activeSessions: data || [] })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchVehicles: async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ vehicles: data || [] })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  createSession: async (params: CreateSessionParams) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: pricingTier } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('id', params.pricingTierId)
        .maybeSingle()

      if (!pricingTier) throw new Error('Invalid pricing tier')

      const totalAmount = Math.min(
        pricingTier.price_per_hour * params.durationHours,
        pricingTier.daily_max || Infinity
      )

      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + params.durationHours)

      const qrCode = `PARK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const { data: session, error } = await supabase
        .from('parking_sessions')
        .insert({
          user_id: user.id,
          vehicle_id: params.vehicleId || null,
          pricing_tier_id: params.pricingTierId,
          expires_at: expiresAt.toISOString(),
          total_amount: totalAmount,
          qr_code: qrCode,
          license_plate_entry: params.licensePlate || null,
          session_status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      await get().fetchActiveSessions()
      return { error: null, session }
    } catch (err) {
      set({ error: (err as Error).message })
      return { error: err as Error }
    } finally {
      set({ isLoading: false })
    }
  },

  extendSession: async (sessionId: string, additionalHours: number) => {
    set({ isLoading: true, error: null })
    try {
      const { data: session } = await supabase
        .from('parking_sessions')
        .select('*, pricing_tier:pricing_tiers(*)')
        .eq('id', sessionId)
        .maybeSingle()

      if (!session) throw new Error('Session not found')

      const pricingTier = session.pricing_tier as PricingTier
      const additionalAmount = pricingTier.price_per_hour * additionalHours

      const currentExpiry = new Date(session.expires_at)
      const newExpiry = new Date(currentExpiry)
      newExpiry.setHours(newExpiry.getHours() + additionalHours)

      const newTotal = Math.min(
        session.total_amount + additionalAmount,
        pricingTier.daily_max || Infinity
      )

      const { error } = await supabase
        .from('parking_sessions')
        .update({
          expires_at: newExpiry.toISOString(),
          total_amount: newTotal,
        })
        .eq('id', sessionId)

      if (error) throw error

      await get().fetchActiveSessions()
      return { error: null }
    } catch (err) {
      set({ error: (err as Error).message })
      return { error: err as Error }
    } finally {
      set({ isLoading: false })
    }
  },

  endSession: async (sessionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('parking_sessions')
        .update({
          session_status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      if (error) throw error

      await get().fetchActiveSessions()
      return { error: null }
    } catch (err) {
      set({ error: (err as Error).message })
      return { error: err as Error }
    } finally {
      set({ isLoading: false })
    }
  },

  addVehicle: async (vehicle) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (vehicle.is_default) {
        await supabase
          .from('vehicles')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const { error } = await supabase
        .from('vehicles')
        .insert({ ...vehicle, user_id: user.id })

      if (error) throw error

      await get().fetchVehicles()
      return { error: null }
    } catch (err) {
      set({ error: (err as Error).message })
      return { error: err as Error }
    } finally {
      set({ isLoading: false })
    }
  },

  deleteVehicle: async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error

      await get().fetchVehicles()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },

  setSelectedLot: (lot) => set({ selectedLot: lot }),
  setSelectedSection: (section) => set({ selectedSection: section }),
}))

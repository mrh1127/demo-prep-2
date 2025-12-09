import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { SavedLocation, GeoPosition } from '@/types'

interface LocationState {
  savedLocation: SavedLocation | null
  currentPosition: GeoPosition | null
  isWatching: boolean
  isLoading: boolean
  error: string | null
  offlineLocations: SavedLocation[]
  fetchSavedLocation: () => Promise<void>
  saveLocation: (params: SaveLocationParams) => Promise<{ error: Error | null }>
  updateLocation: (id: string, updates: Partial<SavedLocation>) => Promise<{ error: Error | null }>
  deleteLocation: (id: string) => Promise<{ error: Error | null }>
  getCurrentPosition: () => Promise<GeoPosition | null>
  startWatchingPosition: () => void
  stopWatchingPosition: () => void
  cacheLocationOffline: (location: SavedLocation) => void
  syncOfflineLocations: () => Promise<void>
}

interface SaveLocationParams {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  heading?: number
  parkingSessionId?: string
  parkingLotId?: string
  sectionId?: string
  spotId?: string
  photoUrl?: string
  notes?: string
}

let watchId: number | null = null

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      savedLocation: null,
      currentPosition: null,
      isWatching: false,
      isLoading: false,
      error: null,
      offlineLocations: [],

      fetchSavedLocation: async () => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('saved_locations')
            .select(`
              *,
              parking_lot:parking_lots(*),
              section:parking_sections(*)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (error) throw error
          set({ savedLocation: data })

          if (data) {
            get().cacheLocationOffline(data)
          }
        } catch (err) {
          set({ error: (err as Error).message })
          const offlineLocations = get().offlineLocations
          if (offlineLocations.length > 0) {
            set({ savedLocation: offlineLocations[0] })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      saveLocation: async (params: SaveLocationParams) => {
        set({ isLoading: true, error: null })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) throw new Error('Not authenticated')

          await supabase
            .from('saved_locations')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true)

          const { data, error } = await supabase
            .from('saved_locations')
            .insert({
              user_id: user.id,
              latitude: params.latitude,
              longitude: params.longitude,
              accuracy: params.accuracy,
              altitude: params.altitude,
              heading: params.heading,
              parking_session_id: params.parkingSessionId,
              parking_lot_id: params.parkingLotId,
              section_id: params.sectionId,
              spot_id: params.spotId,
              photo_url: params.photoUrl,
              notes: params.notes,
              is_active: true,
            })
            .select(`
              *,
              parking_lot:parking_lots(*),
              section:parking_sections(*)
            `)
            .single()

          if (error) throw error

          set({ savedLocation: data })
          get().cacheLocationOffline(data)
          return { error: null }
        } catch (err) {
          set({ error: (err as Error).message })
          return { error: err as Error }
        } finally {
          set({ isLoading: false })
        }
      },

      updateLocation: async (id: string, updates: Partial<SavedLocation>) => {
        try {
          const { error } = await supabase
            .from('saved_locations')
            .update(updates)
            .eq('id', id)

          if (error) throw error

          await get().fetchSavedLocation()
          return { error: null }
        } catch (err) {
          return { error: err as Error }
        }
      },

      deleteLocation: async (id: string) => {
        try {
          const { error } = await supabase
            .from('saved_locations')
            .update({ is_active: false })
            .eq('id', id)

          if (error) throw error

          set({ savedLocation: null })
          return { error: null }
        } catch (err) {
          return { error: err as Error }
        }
      },

      getCurrentPosition: async () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            set({ error: 'Geolocation is not supported' })
            resolve(null)
            return
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const geoPosition: GeoPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude ?? undefined,
                heading: position.coords.heading ?? undefined,
              }
              set({ currentPosition: geoPosition, error: null })
              resolve(geoPosition)
            },
            (err) => {
              set({ error: err.message })
              resolve(null)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          )
        })
      },

      startWatchingPosition: () => {
        if (!navigator.geolocation || watchId !== null) return

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const geoPosition: GeoPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude ?? undefined,
              heading: position.coords.heading ?? undefined,
            }
            set({ currentPosition: geoPosition, isWatching: true, error: null })
          },
          (err) => {
            set({ error: err.message })
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        )

        set({ isWatching: true })
      },

      stopWatchingPosition: () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
          watchId = null
        }
        set({ isWatching: false })
      },

      cacheLocationOffline: (location: SavedLocation) => {
        set((state) => ({
          offlineLocations: [location, ...state.offlineLocations.filter(l => l.id !== location.id)].slice(0, 5),
        }))
      },

      syncOfflineLocations: async () => {
        const offlineLocations = get().offlineLocations
        if (offlineLocations.length === 0) return

        try {
          await get().fetchSavedLocation()
        } catch {
          // Keep offline data if sync fails
        }
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        offlineLocations: state.offlineLocations,
        savedLocation: state.savedLocation,
      }),
    }
  )
)

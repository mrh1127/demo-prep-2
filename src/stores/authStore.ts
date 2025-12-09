import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            set({ user: session.user })
            await get().fetchProfile()
          }
        } finally {
          set({ isInitialized: true })
        }

        supabase.auth.onAuthStateChange((event, session) => {
          (async () => {
            if (event === 'SIGNED_IN' && session?.user) {
              set({ user: session.user })
              await get().fetchProfile()
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null })
            }
          })()
        })
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) return { error }
          return { error: null }
        } finally {
          set({ isLoading: false })
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName }
            }
          })
          if (error) return { error }
          return { error: null }
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        try {
          await supabase.auth.signOut()
          set({ user: null, profile: null })
        } finally {
          set({ isLoading: false })
        }
      },

      fetchProfile: async () => {
        const user = get().user
        if (!user) return

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (data) {
          set({ profile: data })
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const user = get().user
        if (!user) return { error: new Error('Not authenticated') }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)

        if (!error) {
          await get().fetchProfile()
        }

        return { error: error as Error | null }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

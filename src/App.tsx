import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Layout } from '@/components/layout/Layout'
import { AuthForm } from '@/components/auth/AuthForm'
import { Loading } from '@/components/common/Loading'
import { HomePage } from '@/pages/HomePage'
import { ParkingPage } from '@/pages/ParkingPage'
import { FindCarPage } from '@/pages/FindCarPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return <Loading fullScreen />
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />
  }

  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return <Loading fullScreen />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  const { initialize, isInitialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isInitialized) {
    return <Loading fullScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth/signin"
          element={
            <AuthRoute>
              <AuthForm mode="signin" />
            </AuthRoute>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <AuthRoute>
              <AuthForm mode="signup" />
            </AuthRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking"
          element={
            <ProtectedRoute>
              <Layout>
                <ParkingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-car"
          element={
            <ProtectedRoute>
              <Layout>
                <FindCarPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <HistoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

import { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useAppStore } from '@/stores/appStore'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isLargeText, isHighContrast } = useAppStore()

  return (
    <div
      className={`min-h-screen bg-gray-50 flex flex-col ${
        isLargeText ? 'text-lg' : ''
      } ${isHighContrast ? 'contrast-more' : ''}`}
    >
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}

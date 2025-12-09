import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?: string
}

export function Loading({ size = 'md', fullScreen = false, text }: LoadingProps) {
  const { t } = useTranslation()
  const displayText = text || t('common.loading')

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
          <p className="text-gray-600 font-medium">{displayText}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
        {text && <p className="text-gray-600 text-sm">{displayText}</p>}
      </div>
    </div>
  )
}

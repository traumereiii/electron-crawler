import { LucideIcon } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* Icon Container with Gradient Background */}
      <div className="mb-4 p-4 bg-gradient-to-br from-brand-purple-50 to-brand-pink-50 rounded-2xl shadow-sm">
        {Icon && <Icon className="size-12 text-brand-purple-500" />}
      </div>

      {/* Title */}
      <h3 className="text-heading-md text-slate-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-body-sm text-slate-600 mb-6 max-w-sm leading-relaxed">{description}</p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 hover:from-brand-purple-600 hover:to-brand-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

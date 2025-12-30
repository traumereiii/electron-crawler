import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Palette } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

export type ThemeValue = 'light' | 'dark' | 'system'

export interface ThemeSettingsValues {
  theme: ThemeValue
}

interface ThemeSettingsProps {
  values: ThemeSettingsValues
  onUpdate: <K extends keyof ThemeSettingsValues>(key: K, value: ThemeSettingsValues[K]) => void
}

export default function ThemeSettings({ values, onUpdate }: ThemeSettingsProps) {
  const themes: { value: ThemeValue; label: string }[] = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
    { value: 'system', label: '시스템' }
  ]

  return (
    <Card className="shadow-lg border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Palette className="size-6 text-brand-purple-600" />
          테마 설정
        </CardTitle>
        <CardDescription>애플리케이션 테마를 선택합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {themes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onUpdate('theme', value)}
              className={cn(
                'p-6 rounded-xl border-2 transition-all duration-200',
                values.theme === value
                  ? 'border-brand-purple-500 bg-brand-purple-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
            >
              <div className="text-center">
                <div
                  className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-lg',
                    value === 'light' && 'bg-white border-2 border-slate-200',
                    value === 'dark' && 'bg-slate-900',
                    value === 'system' && 'bg-gradient-to-br from-white to-slate-900'
                  )}
                />
                <p className="font-medium text-slate-900">{label}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-body-sm text-slate-500 text-center">
          선택한 테마: <span className="font-semibold">{values.theme}</span>
        </p>
      </CardContent>
    </Card>
  )
}

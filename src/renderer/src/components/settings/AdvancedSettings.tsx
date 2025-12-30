import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Button } from '@renderer/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Code } from 'lucide-react'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface AdvancedSettingsValues {
  logLevel: LogLevel
}

interface AdvancedSettingsProps {
  values: AdvancedSettingsValues
  onUpdate: <K extends keyof AdvancedSettingsValues>(
    key: K,
    value: AdvancedSettingsValues[K]
  ) => void
}

export default function AdvancedSettings({ values, onUpdate }: AdvancedSettingsProps) {
  const logLevels: { value: LogLevel; label: string }[] = [
    { value: 'error', label: 'Error (에러만)' },
    { value: 'warn', label: 'Warning (경고 이상)' },
    { value: 'info', label: 'Info (정보 이상)' },
    { value: 'debug', label: 'Debug (모든 로그)' }
  ]

  return (
    <Card className="shadow-lg border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Code className="size-6 text-brand-purple-600" />
          고급 설정
        </CardTitle>
        <CardDescription>개발자 및 고급 사용자를 위한 설정</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="log-level" className="text-body-md">
            로그 레벨
          </Label>
          <Select
            value={values.logLevel}
            onValueChange={(value: LogLevel) => onUpdate('logLevel', value)}
          >
            <SelectTrigger id="log-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {logLevels.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-body-sm text-slate-500">로그 출력 수준을 설정합니다</p>
        </div>

        <div className="space-y-3">
          <Label className="text-body-md">개발자 도구</Label>
          <Button variant="outline" className="w-full" disabled>
            <Code className="size-4 mr-2" />
            개발자 도구 열기 (준비 중)
          </Button>
          <p className="text-body-sm text-slate-500">브라우저 개발자 도구를 엽니다 (F12)</p>
        </div>
      </CardContent>
    </Card>
  )
}

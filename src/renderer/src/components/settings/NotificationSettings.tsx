import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Bell } from 'lucide-react'

export interface NotificationSettingsValues {
  collectCompleteNotification: boolean
  errorNotification: boolean
  notificationSound: boolean
}

interface NotificationSettingsProps {
  values: NotificationSettingsValues
  onUpdate: <K extends keyof NotificationSettingsValues>(
    key: K,
    value: NotificationSettingsValues[K]
  ) => void
}

export default function NotificationSettings({ values, onUpdate }: NotificationSettingsProps) {
  return (
    <Card className="shadow-lg border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Bell className="size-6 text-brand-purple-600" />
          알림 설정
        </CardTitle>
        <CardDescription>알림 수신 방식을 설정합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="space-y-0.5">
            <Label htmlFor="collect-notification" className="text-body-md cursor-pointer">
              수집 완료 알림
            </Label>
            <p className="text-body-sm text-slate-500">데이터 수집이 완료되면 알림을 표시합니다</p>
          </div>
          <Switch
            id="collect-notification"
            checked={values.collectCompleteNotification}
            onCheckedChange={(checked) => onUpdate('collectCompleteNotification', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="space-y-0.5">
            <Label htmlFor="error-notification" className="text-body-md cursor-pointer">
              에러 알림
            </Label>
            <p className="text-body-sm text-slate-500">에러 발생 시 알림을 표시합니다</p>
          </div>
          <Switch
            id="error-notification"
            checked={values.errorNotification}
            onCheckedChange={(checked) => onUpdate('errorNotification', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="space-y-0.5">
            <Label htmlFor="notification-sound" className="text-body-md cursor-pointer">
              알림 사운드
            </Label>
            <p className="text-body-sm text-slate-500">알림 시 사운드를 재생합니다</p>
          </div>
          <Switch
            id="notification-sound"
            checked={values.notificationSound}
            onCheckedChange={(checked) => onUpdate('notificationSound', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

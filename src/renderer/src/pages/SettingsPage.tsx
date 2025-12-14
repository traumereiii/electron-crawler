import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Slider } from '@renderer/components/ui/slider'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  Settings,
  Bell,
  Palette,
  Database,
  Code,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { toast } from 'sonner'

type SettingsSection = 'crawler' | 'notification' | 'theme' | 'database' | 'advanced'

interface SettingsState {
  // Crawler Settings
  pageTimeout: number
  maxConcurrentTabs: number
  headlessMode: boolean
  retryCount: number

  // Notification Settings
  collectCompleteNotification: boolean
  errorNotification: boolean
  notificationSound: boolean

  // Theme Settings
  theme: 'light' | 'dark' | 'system'

  // Database Settings
  dbPath: string

  // Advanced Settings
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

const defaultSettings: SettingsState = {
  pageTimeout: 30,
  maxConcurrentTabs: 5,
  headlessMode: false,
  retryCount: 3,
  collectCompleteNotification: true,
  errorNotification: true,
  notificationSound: false,
  theme: 'system',
  dbPath: './prisma/app.db',
  logLevel: 'info'
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('crawler')
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const sections = [
    { id: 'crawler' as const, label: '크롤러 설정', icon: Settings },
    { id: 'notification' as const, label: '알림 설정', icon: Bell },
    { id: 'theme' as const, label: '테마 설정', icon: Palette },
    { id: 'database' as const, label: '데이터베이스', icon: Database },
    { id: 'advanced' as const, label: '고급 설정', icon: Code }
  ]

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // TODO: Save settings to localStorage or backend
    toast.success('설정이 저장되었습니다')
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast.info('기본값으로 초기화되었습니다')
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="mb-6">
        <h1 className="text-display-sm text-slate-900 mb-2">설정</h1>
        <p className="text-body-md text-slate-600">애플리케이션 설정을 관리합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 h-fit lg:sticky lg:top-6 shadow-lg border-0">
          <CardContent className="pt-6">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 text-white shadow-md'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-5" />
                      <span className="font-medium">{section.label}</span>
                    </div>
                    {activeSection === section.id && <ChevronRight className="size-4" />}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Crawler Settings */}
          {activeSection === 'crawler' && (
            <Card className="shadow-lg border-0 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="size-6 text-brand-purple-600" />
                  크롤러 설정
                </CardTitle>
                <CardDescription>데이터 수집 동작을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Page Timeout */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="page-timeout" className="text-body-md">
                      페이지 타임아웃
                    </Label>
                    <span className="text-brand-purple-600 font-semibold">
                      {settings.pageTimeout}초
                    </span>
                  </div>
                  <Slider
                    id="page-timeout"
                    min={5}
                    max={60}
                    step={5}
                    value={[settings.pageTimeout]}
                    onValueChange={([value]) => updateSetting('pageTimeout', value)}
                    className="cursor-pointer"
                  />
                  <p className="text-body-sm text-slate-500">
                    페이지 로드 대기 시간을 설정합니다 (5~60초)
                  </p>
                </div>

                {/* Max Concurrent Tabs */}
                <div className="space-y-3">
                  <Label htmlFor="max-tabs" className="text-body-md">
                    최대 동시 탭 수
                  </Label>
                  <Select
                    value={settings.maxConcurrentTabs.toString()}
                    onValueChange={(value) => updateSetting('maxConcurrentTabs', parseInt(value))}
                  >
                    <SelectTrigger id="max-tabs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1개</SelectItem>
                      <SelectItem value="2">2개</SelectItem>
                      <SelectItem value="5">5개</SelectItem>
                      <SelectItem value="10">10개</SelectItem>
                      <SelectItem value="20">20개</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-body-sm text-slate-500">
                    동시에 열 수 있는 최대 탭 수를 설정합니다
                  </p>
                </div>

                {/* Headless Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label htmlFor="headless-mode" className="text-body-md cursor-pointer">
                      헤드리스 모드
                    </Label>
                    <p className="text-body-sm text-slate-500">
                      브라우저 창을 표시하지 않고 백그라운드에서 실행합니다
                    </p>
                  </div>
                  <Switch
                    id="headless-mode"
                    checked={settings.headlessMode}
                    onCheckedChange={(checked) => updateSetting('headlessMode', checked)}
                  />
                </div>

                {/* Retry Count */}
                <div className="space-y-3">
                  <Label htmlFor="retry-count" className="text-body-md">
                    재시도 횟수
                  </Label>
                  <Input
                    id="retry-count"
                    type="number"
                    min={0}
                    max={10}
                    value={settings.retryCount}
                    onChange={(e) => updateSetting('retryCount', parseInt(e.target.value) || 0)}
                    className="max-w-xs"
                  />
                  <p className="text-body-sm text-slate-500">
                    실패 시 재시도할 횟수를 설정합니다 (0~10회)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeSection === 'notification' && (
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
                    <p className="text-body-sm text-slate-500">
                      데이터 수집이 완료되면 알림을 표시합니다
                    </p>
                  </div>
                  <Switch
                    id="collect-notification"
                    checked={settings.collectCompleteNotification}
                    onCheckedChange={(checked) =>
                      updateSetting('collectCompleteNotification', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label htmlFor="error-notification" className="text-body-md cursor-pointer">
                      에러 알림
                    </Label>
                    <p className="text-body-sm text-slate-500">
                      에러 발생 시 알림을 표시합니다
                    </p>
                  </div>
                  <Switch
                    id="error-notification"
                    checked={settings.errorNotification}
                    onCheckedChange={(checked) => updateSetting('errorNotification', checked)}
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
                    checked={settings.notificationSound}
                    onCheckedChange={(checked) => updateSetting('notificationSound', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Theme Settings */}
          {activeSection === 'theme' && (
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
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSetting('theme', theme)}
                      className={cn(
                        'p-6 rounded-xl border-2 transition-all duration-200',
                        settings.theme === theme
                          ? 'border-brand-purple-500 bg-brand-purple-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      )}
                    >
                      <div className="text-center">
                        <div
                          className={cn(
                            'w-12 h-12 mx-auto mb-3 rounded-lg',
                            theme === 'light' && 'bg-white border-2 border-slate-200',
                            theme === 'dark' && 'bg-slate-900',
                            theme === 'system' && 'bg-gradient-to-br from-white to-slate-900'
                          )}
                        />
                        <p className="font-medium text-slate-900">
                          {theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-body-sm text-slate-500 text-center">
                  선택한 테마: <span className="font-semibold">{settings.theme}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Database Settings */}
          {activeSection === 'database' && (
            <Card className="shadow-lg border-0 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="size-6 text-brand-purple-600" />
                  데이터베이스 설정
                </CardTitle>
                <CardDescription>데이터베이스 관리 및 설정</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-body-md">데이터베이스 경로</Label>
                  <div className="p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-700">
                    {settings.dbPath}
                  </div>
                  <p className="text-body-sm text-slate-500">현재 사용 중인 데이터베이스 경로</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</h4>
                  <p className="text-body-sm text-amber-800">
                    데이터베이스를 정리하면 모든 수집 데이터가 영구적으로 삭제됩니다. 이 작업은
                    되돌릴 수 없습니다.
                  </p>
                </div>

                <Button variant="destructive" className="w-full" disabled>
                  <Database className="size-4 mr-2" />
                  데이터베이스 정리 (준비 중)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          {activeSection === 'advanced' && (
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
                    value={settings.logLevel}
                    onValueChange={(value: SettingsState['logLevel']) =>
                      updateSetting('logLevel', value)
                    }
                  >
                    <SelectTrigger id="log-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error (에러만)</SelectItem>
                      <SelectItem value="warn">Warning (경고 이상)</SelectItem>
                      <SelectItem value="info">Info (정보 이상)</SelectItem>
                      <SelectItem value="debug">Debug (모든 로그)</SelectItem>
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
                  <p className="text-body-sm text-slate-500">
                    브라우저 개발자 도구를 엽니다 (F12)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {hasChanges && (
            <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50 animate-slide-up">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body-sm text-slate-600">변경사항이 있습니다. 저장하시겠습니까?</p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="size-4 mr-2" />
                      초기화
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 hover:from-brand-purple-600 hover:to-brand-pink-600"
                    >
                      <Save className="size-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

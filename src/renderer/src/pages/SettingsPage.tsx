import { useState } from 'react'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import {
  Bell,
  ChevronRight,
  Code,
  Database,
  Palette,
  RotateCcw,
  Save,
  Settings
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { toast } from 'sonner'
import CrawlerSettings, {
  CrawlerSettingsValues
} from '@renderer/components/settings/CrawlerSettings'
import NotificationSettings, {
  NotificationSettingsValues
} from '@renderer/components/settings/NotificationSettings'
import ThemeSettings, { ThemeSettingsValues } from '@renderer/components/settings/ThemeSettings'
import DatabaseSettings, {
  DatabaseSettingsValues
} from '@renderer/components/settings/DatabaseSettings'
import AdvancedSettings, {
  AdvancedSettingsValues
} from '@renderer/components/settings/AdvancedSettings'

type SettingsSection = 'crawler' | 'notification' | 'theme' | 'database' | 'advanced'

interface SettingsState
  extends CrawlerSettingsValues,
    NotificationSettingsValues,
    ThemeSettingsValues,
    DatabaseSettingsValues,
    AdvancedSettingsValues {}

const defaultSettings: SettingsState = {
  // Crawler Settings
  pageTimeout: 30,
  maxConcurrentTabs: 5,
  headlessMode: false,
  retryCount: 3,
  // Notification Settings
  collectCompleteNotification: true,
  errorNotification: true,
  notificationSound: false,
  // Theme Settings
  theme: 'system',
  // Database Settings
  dbPath: './prisma/app.db',
  // Advanced Settings
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
          {activeSection === 'crawler' && (
            <CrawlerSettings
              values={{
                pageTimeout: settings.pageTimeout,
                maxConcurrentTabs: settings.maxConcurrentTabs,
                headlessMode: settings.headlessMode,
                retryCount: settings.retryCount
              }}
              onUpdate={updateSetting}
            />
          )}

          {activeSection === 'notification' && (
            <NotificationSettings
              values={{
                collectCompleteNotification: settings.collectCompleteNotification,
                errorNotification: settings.errorNotification,
                notificationSound: settings.notificationSound
              }}
              onUpdate={updateSetting}
            />
          )}

          {activeSection === 'theme' && (
            <ThemeSettings
              values={{
                theme: settings.theme
              }}
              onUpdate={updateSetting}
            />
          )}

          {activeSection === 'database' && (
            <DatabaseSettings
              values={{
                dbPath: settings.dbPath
              }}
              onUpdate={updateSetting}
            />
          )}

          {activeSection === 'advanced' && (
            <AdvancedSettings
              values={{
                logLevel: settings.logLevel
              }}
              onUpdate={updateSetting}
            />
          )}

          {/* Action Buttons */}
          {hasChanges && (
            <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50 animate-slide-up">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body-sm text-slate-600">
                    변경사항이 있습니다. 저장하시겠습니까?
                  </p>
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

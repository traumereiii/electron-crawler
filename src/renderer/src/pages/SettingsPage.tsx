import { useEffect, useState } from 'react'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Bell, ChevronRight, Database, MessageCircleQuestion, Settings } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import ScheduledCrawlerSettings, {
  CrawlerSettingsValues
} from '@renderer/components/settings/ScheduledCrawlerSettings'
import NotificationSettings, {
  NotificationSettingsValues
} from '@renderer/components/settings/NotificationSettings'
import DatabaseSettings, {
  DatabaseSettingsValues
} from '@renderer/components/settings/DatabaseSettings'
import AdvancedSettings, {
  AdvancedSettingsValues
} from '@renderer/components/settings/AdvancedSettings'
import InquirySettings from '@renderer/components/settings/InquirySettings'
import { IPC_KEYS } from '@/lib/constant'

type SettingsSection = 'crawler' | 'notification' | 'theme' | 'database' | 'advanced' | 'inquiry'

interface SettingsState
  extends CrawlerSettingsValues,
    NotificationSettingsValues,
    DatabaseSettingsValues,
    AdvancedSettingsValues {}

const defaultSettings: SettingsState = {
  // Crawler Settings
  maxConcurrentTabs: [2, 4, 5],
  headlessMode: false,
  screenshot: false,
  retryCount: 3,
  // Notification Settings
  collectCompleteNotification: true,
  errorNotification: true,
  // Database Settings
  dbPath: './prisma/app.db',
  autoDeleteDays: 0,
  // Advanced Settings
  logLevel: 'info'
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('crawler')
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)

  const sections = [
    { id: 'notification' as const, label: '알림 설정', icon: Bell },
    { id: 'crawler' as const, label: '스케줄러 수집 설정', icon: Settings },
    { id: 'database' as const, label: '데이터베이스', icon: Database },
    { id: 'inquiry' as const, label: '문의하기', icon: MessageCircleQuestion }
  ]

  // 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      // 알림 설정 및 크롤러 설정 (데이터베이스)
      const dbSettings = await window.$renderer.request<Record<string, string>>(
        IPC_KEYS.settings.getAll
      )

      setSettings((prev) => ({
        ...prev,
        // 알림 설정
        ...(dbSettings.USE_ALERT_ON_FINISH && {
          collectCompleteNotification: dbSettings.USE_ALERT_ON_FINISH === 'Y'
        }),
        ...(dbSettings.USE_ALERT_ON_ERROR && {
          errorNotification: dbSettings.USE_ALERT_ON_ERROR === 'Y'
        }),
        // 크롤러 설정
        ...(dbSettings.SCHEDULED_CRAWLER_TAB_1 &&
          dbSettings.SCHEDULED_CRAWLER_TAB_2 &&
          dbSettings.SCHEDULED_CRAWLER_TAB_3 && {
            maxConcurrentTabs: [
              parseInt(dbSettings.SCHEDULED_CRAWLER_TAB_1),
              parseInt(dbSettings.SCHEDULED_CRAWLER_TAB_2),
              parseInt(dbSettings.SCHEDULED_CRAWLER_TAB_3)
            ]
          }),
        ...(dbSettings.SCHEDULED_CRAWLER_HEADLESS && {
          headlessMode: dbSettings.SCHEDULED_CRAWLER_HEADLESS === 'Y'
        }),
        ...(dbSettings.SCHEDULED_CRAWLER_SCREENSHOT && {
          screenshot: dbSettings.SCHEDULED_CRAWLER_SCREENSHOT === 'Y'
        }),
        // 데이터베이스 설정
        ...(dbSettings.AUTO_DELETE_DATABASE_IN_DAYS && {
          autoDeleteDays: parseInt(dbSettings.AUTO_DELETE_DATABASE_IN_DAYS) || 0
        })
      }))
    }

    loadSettings()
  }, [])

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // CrawlerSettingsValues 전용 업데이트 함수
  const updateCrawlerSetting = <K extends keyof CrawlerSettingsValues>(
    key: K,
    value: CrawlerSettingsValues[K]
  ) => {
    updateSetting(key as keyof SettingsState, value as SettingsState[keyof SettingsState])
  }

  // DatabaseSettingsValues 전용 업데이트 함수
  const updateDatabaseSetting = <K extends keyof DatabaseSettingsValues>(
    key: K,
    value: DatabaseSettingsValues[K]
  ) => {
    updateSetting(key as keyof SettingsState, value as SettingsState[keyof SettingsState])
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
                        ? 'bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 text-black shadow-md'
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
            <ScheduledCrawlerSettings
              values={{
                maxConcurrentTabs: settings.maxConcurrentTabs,
                headlessMode: settings.headlessMode,
                screenshot: settings.screenshot,
                retryCount: settings.retryCount
              }}
              onUpdate={updateCrawlerSetting}
            />
          )}

          {activeSection === 'notification' && (
            <NotificationSettings
              values={{
                collectCompleteNotification: settings.collectCompleteNotification,
                errorNotification: settings.errorNotification
              }}
              onUpdate={updateSetting}
            />
          )}

          {activeSection === 'database' && (
            <DatabaseSettings
              values={{
                dbPath: settings.dbPath,
                autoDeleteDays: settings.autoDeleteDays
              }}
              onUpdate={updateDatabaseSetting}
            />
          )}

          {activeSection === 'inquiry' && <InquirySettings />}

          {activeSection === 'advanced' && (
            <AdvancedSettings
              values={{
                logLevel: settings.logLevel
              }}
              onUpdate={updateSetting}
            />
          )}
        </div>
      </div>
    </div>
  )
}

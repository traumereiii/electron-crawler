import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Slider } from '@renderer/components/ui/slider'
import { Settings } from 'lucide-react'
import { IPC_KEYS } from '@/lib/constant'
import { toast } from 'sonner'

export interface CrawlerSettingsValues {
  maxConcurrentTabs: [number, number, number]
  headlessMode: boolean
  screenshot: boolean
  retryCount: number
}

interface CrawlerSettingsProps {
  values: CrawlerSettingsValues
  onUpdate: <K extends keyof CrawlerSettingsValues>(key: K, value: CrawlerSettingsValues[K]) => void
}

export default function ScheduledCrawlerSettings({ values, onUpdate }: CrawlerSettingsProps) {
  const handleTabChange = async (level: 1 | 2 | 3, value: number) => {
    const newTabs: [number, number, number] = [...values.maxConcurrentTabs]
    newTabs[level - 1] = value
    onUpdate('maxConcurrentTabs', newTabs)

    try {
      const key = `SCHEDULED_CRAWLER_TAB_${level}` as const
      await window.$renderer.request(IPC_KEYS.settings.set, {
        [key]: value.toString()
      })
      toast.success('설정이 저장되었습니다')
    } catch (error) {
      toast.error('설정 저장에 실패했습니다')
    }
  }

  const handleHeadlessModeChange = async (checked: boolean) => {
    onUpdate('headlessMode', checked)

    try {
      await window.$renderer.request(IPC_KEYS.settings.set, {
        SCHEDULED_CRAWLER_HEADLESS: checked ? 'Y' : 'N'
      })
      toast.success('설정이 저장되었습니다')
    } catch (error) {
      toast.error('설정 저장에 실패했습니다')
    }
  }

  const handleScreenshotChange = async (checked: boolean) => {
    onUpdate('screenshot', checked)

    try {
      await window.$renderer.request(IPC_KEYS.settings.set, {
        SCHEDULED_CRAWLER_SCREENSHOT: checked ? 'Y' : 'N'
      })
      toast.success('설정이 저장되었습니다')
    } catch (error) {
      toast.error('설정 저장에 실패했습니다')
    }
  }

  return (
    <Card className="shadow-lg border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Settings className="size-6 text-brand-purple-600" />
          스케줄러 수집 설정
        </CardTitle>
        <CardDescription>스케줄링 된 데이터 수집 동작을 설정합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Max Concurrent Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <Label className="text-base font-semibold">최대 동시 탭 수</Label>
          </div>

          {/* 레벨 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="level1" className="text-sm">
                레벨1 (카테고리 탭)
              </Label>
              <span className="text-sm font-semibold text-brand-purple-600">
                {values.maxConcurrentTabs[0]}개
              </span>
            </div>
            <Slider
              id="level1"
              min={1}
              max={5}
              step={1}
              value={[values.maxConcurrentTabs[0]]}
              onValueChange={([value]) => handleTabChange(1, value)}
              className="cursor-pointer"
            />
          </div>

          {/* 레벨 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="level2" className="text-sm">
                레벨2 (서브카테고리 탭)
              </Label>
              <span className="text-sm font-semibold text-brand-purple-600">
                {values.maxConcurrentTabs[1]}개
              </span>
            </div>
            <Slider
              id="level2"
              min={1}
              max={10}
              step={1}
              value={[values.maxConcurrentTabs[1]]}
              onValueChange={([value]) => handleTabChange(2, value)}
              className="cursor-pointer"
            />
          </div>

          {/* 레벨 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="level3" className="text-sm">
                레벨3 (상세 페이지 탭)
              </Label>
              <span className="text-sm font-semibold text-brand-purple-600">
                {values.maxConcurrentTabs[2]}개
              </span>
            </div>
            <Slider
              id="level3"
              min={1}
              max={20}
              step={1}
              value={[values.maxConcurrentTabs[2]]}
              onValueChange={([value]) => handleTabChange(3, value)}
              className="cursor-pointer"
            />
          </div>

          <p className="text-body-sm text-slate-500">
            동시에 열 수 있는 최대 탭 수를 레벨별로 설정합니다
          </p>
        </div>

        {/* Browser Mode */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <Label className="text-base font-semibold">브라우저 모드</Label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <Label htmlFor="headless-mode" className="text-sm font-medium">
                Headless 모드
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">백그라운드에서 실행 (UI 없음)</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${values.headlessMode ? 'text-emerald-600' : 'text-slate-500'}`}
              >
                {values.headlessMode ? '켜짐' : '꺼짐'}
              </span>
              <Switch
                id="headless-mode"
                checked={values.headlessMode}
                onCheckedChange={handleHeadlessModeChange}
              />
            </div>
          </div>
        </div>

        {/* Screenshot Setting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <Label className="text-base font-semibold">스크린샷</Label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <Label htmlFor="screenshot" className="text-sm font-medium">
                스크린샷 사용
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">페이지 수집 시 스크린샷 캡처</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${values.screenshot ? 'text-emerald-600' : 'text-slate-500'}`}
              >
                {values.screenshot ? '켜짐' : '꺼짐'}
              </span>
              <Switch
                id="screenshot"
                checked={values.screenshot}
                onCheckedChange={handleScreenshotChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

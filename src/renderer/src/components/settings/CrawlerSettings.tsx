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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Settings } from 'lucide-react'

export interface CrawlerSettingsValues {
  pageTimeout: number
  maxConcurrentTabs: number
  headlessMode: boolean
  retryCount: number
}

interface CrawlerSettingsProps {
  values: CrawlerSettingsValues
  onUpdate: <K extends keyof CrawlerSettingsValues>(key: K, value: CrawlerSettingsValues[K]) => void
}

export default function CrawlerSettings({ values, onUpdate }: CrawlerSettingsProps) {
  return (
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
            <span className="text-brand-purple-600 font-semibold">{values.pageTimeout}초</span>
          </div>
          <Slider
            id="page-timeout"
            min={5}
            max={60}
            step={5}
            value={[values.pageTimeout]}
            onValueChange={([value]) => onUpdate('pageTimeout', value)}
            className="cursor-pointer"
          />
          <p className="text-body-sm text-slate-500">페이지 로드 대기 시간을 설정합니다 (5~60초)</p>
        </div>

        {/* Max Concurrent Tabs */}
        <div className="space-y-3">
          <Label htmlFor="max-tabs" className="text-body-md">
            최대 동시 탭 수
          </Label>
          <Select
            value={values.maxConcurrentTabs.toString()}
            onValueChange={(value) => onUpdate('maxConcurrentTabs', parseInt(value))}
          >
            <SelectTrigger id="max-tabs">
              <SelectValue>{values.maxConcurrentTabs}개</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1개</SelectItem>
              <SelectItem value="2">2개</SelectItem>
              <SelectItem value="5">5개</SelectItem>
              <SelectItem value="10">10개</SelectItem>
              <SelectItem value="20">20개</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-body-sm text-slate-500">동시에 열 수 있는 최대 탭 수를 설정합니다</p>
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
            checked={values.headlessMode}
            onCheckedChange={(checked) => onUpdate('headlessMode', checked)}
          />
        </div>

        {/* Retry Count */}
        {/*<div className="space-y-3">*/}
        {/*  <Label htmlFor="retry-count" className="text-body-md">*/}
        {/*    재시도 횟수*/}
        {/*  </Label>*/}
        {/*  <Input*/}
        {/*    id="retry-count"*/}
        {/*    type="number"*/}
        {/*    min={0}*/}
        {/*    max={10}*/}
        {/*    value={values.retryCount}*/}
        {/*    onChange={(e) => onUpdate('retryCount', parseInt(e.target.value) || 0)}*/}
        {/*    className="max-w-xs"*/}
        {/*  />*/}
        {/*  <p className="text-body-sm text-slate-500">실패 시 재시도할 횟수를 설정합니다 (0~10회)</p>*/}
        {/*</div>*/}
      </CardContent>
    </Card>
  )
}

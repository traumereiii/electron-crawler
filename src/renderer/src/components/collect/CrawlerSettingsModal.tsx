import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Slider } from '@renderer/components/ui/slider'
import { toast } from 'sonner'
import {
  useCrawlerSettings,
  useUpdateCrawlerSettings,
  useSetPageRange,
  useResetCrawlerSettings
} from '@renderer/store/crawler-settings'
import { CRAWLER_PARAMS_VALIDATION } from '@/lib/types'

interface CrawlerSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function CrawlerSettingsModal({
  open,
  onOpenChange,
  onConfirm
}: CrawlerSettingsModalProps) {
  const settings = useCrawlerSettings()
  const updateSettings = useUpdateCrawlerSettings()
  const setPageRange = useSetPageRange()
  const resetSettings = useResetCrawlerSettings()

  // 로컬 상태 (입력 필드용)
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(4)
  const [width, setWidth] = useState(1280)
  const [height, setHeight] = useState(720)
  const [headless, setHeadless] = useState(false)
  const [level1Tabs, setLevel1Tabs] = useState(2)
  const [level2Tabs, setLevel2Tabs] = useState(4)
  const [level3Tabs, setLevel3Tabs] = useState(5)

  // 모달이 열릴 때 현재 설정을 로컬 상태에 로드
  useEffect(() => {
    if (open) {
      const pageNumbers = settings.pageNumbers
      setStartPage(pageNumbers.length > 0 ? pageNumbers[0] : 1)
      setEndPage(pageNumbers.length > 0 ? pageNumbers[pageNumbers.length - 1] : 4)
      setWidth(settings.width)
      setHeight(settings.height)
      setHeadless(settings.headless)
      setLevel1Tabs(settings.maxConcurrentTabs[0])
      setLevel2Tabs(settings.maxConcurrentTabs[1])
      setLevel3Tabs(settings.maxConcurrentTabs[2])
    }
  }, [open, settings])

  // 유효성 검증
  const validate = (): boolean => {
    const validation = CRAWLER_PARAMS_VALIDATION

    // 페이지 범위 검증
    if (startPage < validation.pageNumbers.min || startPage > validation.pageNumbers.max) {
      toast.error(validation.pageNumbers.message)
      return false
    }
    if (endPage < validation.pageNumbers.min || endPage > validation.pageNumbers.max) {
      toast.error(validation.pageNumbers.message)
      return false
    }
    if (startPage > endPage) {
      toast.error('시작 페이지는 종료 페이지보다 작거나 같아야 합니다')
      return false
    }

    // 해상도 검증
    if (width < validation.width.min || width > validation.width.max) {
      toast.error(validation.width.message)
      return false
    }
    if (height < validation.height.min || height > validation.height.max) {
      toast.error(validation.height.message)
      return false
    }

    // 탭 수 검증
    if (level1Tabs < validation.maxConcurrentTabs.level1.min || level1Tabs > validation.maxConcurrentTabs.level1.max) {
      toast.error(validation.maxConcurrentTabs.level1.message)
      return false
    }
    if (level2Tabs < validation.maxConcurrentTabs.level2.min || level2Tabs > validation.maxConcurrentTabs.level2.max) {
      toast.error(validation.maxConcurrentTabs.level2.message)
      return false
    }
    if (level3Tabs < validation.maxConcurrentTabs.level3.min || level3Tabs > validation.maxConcurrentTabs.level3.max) {
      toast.error(validation.maxConcurrentTabs.level3.message)
      return false
    }

    return true
  }

  // 확인 버튼 클릭
  const handleConfirm = () => {
    if (!validate()) {
      return
    }

    // 설정 저장
    setPageRange(startPage, endPage)
    updateSettings({
      width,
      height,
      headless,
      maxConcurrentTabs: [level1Tabs, level2Tabs, level3Tabs]
    })

    // 모달 닫고 크롤링 시작
    onOpenChange(false)
    onConfirm()
  }

  // 리셋 버튼 클릭
  const handleReset = () => {
    resetSettings()
    toast.success('설정이 기본값으로 초기화되었습니다')
  }

  // 총 페이지 수 계산
  const totalPages = endPage - startPage + 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>크롤러 설정</DialogTitle>
          <DialogDescription>
            데이터 수집 전 크롤러 파라미터를 설정하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 수집 페이지 범위 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <Label className="text-base font-semibold">수집 페이지 범위</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="startPage" className="text-sm text-muted-foreground">
                  시작 페이지
                </Label>
                <Input
                  id="startPage"
                  type="number"
                  min={1}
                  max={10}
                  value={startPage}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <span className="mt-6">~</span>
              <div className="flex-1">
                <Label htmlFor="endPage" className="text-sm text-muted-foreground">
                  종료 페이지
                </Label>
                <Input
                  id="endPage"
                  type="number"
                  min={1}
                  max={10}
                  value={endPage}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              → 총 <span className="font-semibold text-foreground">{totalPages}</span>개 페이지 수집
            </p>
          </div>

          {/* 브라우저 해상도 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🖥️</span>
              <Label className="text-base font-semibold">브라우저 해상도</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="width" className="text-sm text-muted-foreground">
                  너비 (px)
                </Label>
                <Input
                  id="width"
                  type="number"
                  min={800}
                  max={1920}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <span className="mt-6">×</span>
              <div className="flex-1">
                <Label htmlFor="height" className="text-sm text-muted-foreground">
                  높이 (px)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min={600}
                  max={1080}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 브라우저 모드 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌐</span>
              <Label className="text-base font-semibold">브라우저 모드</Label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="headless" className="text-sm">
                  Headless 모드
                </Label>
                <p className="text-xs text-muted-foreground">
                  백그라운드에서 실행 (UI 없음)
                </p>
              </div>
              <Switch
                id="headless"
                checked={headless}
                onCheckedChange={setHeadless}
              />
            </div>
          </div>

          {/* 동시 실행 탭 수 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <Label className="text-base font-semibold">동시 실행 탭 수</Label>
            </div>

            {/* 레벨 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="level1" className="text-sm">
                  레벨1 (카테고리 탭)
                </Label>
                <span className="text-sm font-semibold">{level1Tabs}개</span>
              </div>
              <Slider
                id="level1"
                min={1}
                max={5}
                step={1}
                value={[level1Tabs]}
                onValueChange={(value) => setLevel1Tabs(value[0])}
              />
            </div>

            {/* 레벨 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="level2" className="text-sm">
                  레벨2 (서브카테고리 탭)
                </Label>
                <span className="text-sm font-semibold">{level2Tabs}개</span>
              </div>
              <Slider
                id="level2"
                min={1}
                max={10}
                step={1}
                value={[level2Tabs]}
                onValueChange={(value) => setLevel2Tabs(value[0])}
              />
            </div>

            {/* 레벨 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="level3" className="text-sm">
                  레벨3 (상세 페이지 탭)
                </Label>
                <span className="text-sm font-semibold">{level3Tabs}개</span>
              </div>
              <Slider
                id="level3"
                min={1}
                max={20}
                step={1}
                value={[level3Tabs]}
                onValueChange={(value) => setLevel3Tabs(value[0])}
              />
            </div>
          </div>

          {/* 주의사항 */}
          <div className="space-y-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <Label className="text-base font-semibold">주의사항</Label>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• 동시 탭 수↑ = 속도↑ but 부하↑</li>
              <li>• Headless 모드 = 리소스↓ but 디버깅↓</li>
              <li>• 설정은 자동으로 저장됩니다</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm}>수집 시작</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

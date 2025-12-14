import { useEffect, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Download, Play, Square, Trash2 } from 'lucide-react'
import LogWindow from '@renderer/components/collect/LogWindow'
import CollectResultTable from '@renderer/components/collect/CollectResultTable'
import { useAddLog, useClearLogs } from '@renderer/store/collect/log'
import PageTitle from '@renderer/components/PageTitle'
import { useAddData, useClearCollectData } from '@renderer/store/collect/collect-data'
import { IPC_KEYS } from '../../../lib/constant'
import { Stock } from '@renderer/types'
import StatWindow from '@renderer/components/collect/StatWindow'
import { useClearCollectStat } from '@renderer/store/collect/collect-stat'
import CrawlerSettingsModal from '@renderer/components/collect/CrawlerSettingsModal'
import { useCrawlerSettings } from '@renderer/store/crawler-settings'

export default function IndexPage() {
  const [isCollecting, setIsCollecting] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const addLog = useAddLog()
  const clearCollectData = useClearCollectData()
  const addData = useAddData()
  const clearCollectStat = useClearCollectStat()
  const clearLogs = useClearLogs()
  const crawlerSettings = useCrawlerSettings()

  useEffect(() => {
    // scroll to top when page loads
    window.scrollTo(0, 0)
    window.$renderer.onReceive(IPC_KEYS.crawler.data, (_event, data: Stock) => {
      addData(data)
    })
  }, [])

  const clearResults = () => {
    clearCollectData()
    clearCollectStat()
    clearLogs()
    addLog({
      type: 'info',
      message: '수집 결과를 초기화 했습니다.'
    })
  }

  const exportResults = () => {
    addLog({
      type: 'success',
      message: '수집 결과를 내보냅니다...'
    })
    setTimeout(() => {
      // addLog('CSV 파일로 내보내기 완료!', 'success')
    }, 500)
  }

  const handleStartCollectClick = () => {
    // 모달 열기
    setIsSettingsModalOpen(true)
  }

  const handleStartCrawling = async () => {
    // 크롤링 시작
    setIsCollecting(true)
    clearCollectStat()

    // 설정을 파라미터로 전달
    const result = await window.$renderer.request<boolean>(
      IPC_KEYS.crawler.start,
      crawlerSettings
    )

    if (!result) {
      setIsCollecting(false)
    }
  }

  const handleStopCollectClick = async () => {
    // addLog('크롤링 수집을 중지합니다...', 'info')
    window.$renderer.removeListener(IPC_KEYS.crawler.stat)
    const result: boolean = await window.$renderer.request(IPC_KEYS.crawler.stop)
    setIsCollecting(!result)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageTitle title={'데이터 수집'} description={'네이버 증권 테마별 주가 수집'} />
        <div className="flex gap-3">
          {!isCollecting ? (
            <Button
              onClick={handleStartCollectClick}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
            >
              <Play className="size-4 mr-2" />
              수집 시작
            </Button>
          ) : (
            <Button
              onClick={handleStopCollectClick}
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Square className="size-4 mr-2" />
              수집 종료
            </Button>
          )}
          <Button
            onClick={exportResults}
            variant="outline"
            size="lg"
            className="border-gray-300 hover:bg-gray-50"
          >
            <Download className="size-4 mr-2" />
            내보내기
          </Button>
          <Button
            onClick={clearResults}
            variant="outline"
            size="lg"
            className="border-gray-300 hover:bg-gray-50"
          >
            <Trash2 className="size-4 mr-2" />
            초기화
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatWindow />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results Table */}
        <CollectResultTable />

        {/* Logs */}
        <LogWindow />
      </div>

      {/* Status Bar */}
      {isCollecting && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-3 bg-emerald-600 rounded-full animate-pulse" />
              <span className="text-emerald-800">크롤링 진행 중...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crawler Settings Modal */}
      <CrawlerSettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        onConfirm={handleStartCrawling}
      />
    </>
  )
}

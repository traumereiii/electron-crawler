import { useEffect, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Download, Play, Square, Trash2 } from 'lucide-react'
import LogWindow from '@renderer/components/collect/LogWindow'
import CollectResultTable from '@renderer/components/collect/CollectResultTable'
import { useAddLog, useClearLogs } from '@renderer/store/collect/log'
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
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-purple-500 via-brand-pink-500 to-orange-400 p-8 mb-6 shadow-xl animate-fade-in">
        <div className="relative z-10">
          <h1 className="text-display-md text-white mb-2 drop-shadow-lg">데이터 수집</h1>
          <p className="text-body-lg text-purple-100 mb-6">
            네이버 증권에서 테마별 주가를 자동으로 수집합니다
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isCollecting ? (
              <Button
                onClick={handleStartCollectClick}
                size="lg"
                className="bg-white text-brand-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <Play className="size-4 mr-2" />
                수집 시작
              </Button>
            ) : (
              <Button
                onClick={handleStopCollectClick}
                size="lg"
                className="bg-white/90 text-gray-700 hover:bg-white shadow-lg"
              >
                <Square className="size-4 mr-2" />
                수집 종료
              </Button>
            )}
            <Button
              onClick={exportResults}
              size="lg"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-lg"
            >
              <Download className="size-4 mr-2" />
              내보내기
            </Button>
            <Button
              onClick={clearResults}
              size="lg"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-lg"
            >
              <Trash2 className="size-4 mr-2" />
              초기화
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
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
        <Card className="border-0 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md animate-fade-in">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-3 bg-emerald-600 rounded-full animate-pulse" />
                <div className="absolute inset-0 size-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div>
                <span className="text-emerald-900 font-medium">크롤링 진행 중...</span>
                <p className="text-emerald-700 text-sm mt-0.5">데이터를 수집하고 있습니다</p>
              </div>
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

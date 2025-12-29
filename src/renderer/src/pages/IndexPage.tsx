import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
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
import {
  useClearSessionId,
  useCurrentSessionId,
  useSetSessionId
} from '@renderer/store/collect/current-session'

export default function IndexPage() {
  const location = useLocation()
  const [isCollecting, setIsCollecting] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const addLog = useAddLog()
  const clearCollectData = useClearCollectData()
  const addData = useAddData()
  const clearCollectStat = useClearCollectStat()
  const clearLogs = useClearLogs()
  const crawlerSettings = useCrawlerSettings()
  const currentSessionId = useCurrentSessionId()
  const setSessionId = useSetSessionId()
  const clearSessionId = useClearSessionId()

  useEffect(() => {
    // scroll to top when page loads
    window.scrollTo(0, 0)

    // 크롤링 세션
    window.$renderer.onReceive(IPC_KEYS.crawler.session, (_event, sessionId: string) => {
      setSessionId(sessionId)
      setIsCollecting(true)
    })

    window.$renderer.onReceive(IPC_KEYS.crawler.finish, (_event) => {
      setIsCollecting(false)
      addLog({
        type: 'info',
        message: `수집이 종료되었습니다.`
      })
    })

    // 크롤링 데이터 수신
    window.$renderer.onReceive(IPC_KEYS.crawler.data, (_event, data: Stock) => {
      addData(data)
    })

    // 스케줄에서 즉시 실행으로 이동한 경우
    const state = location.state as { sessionId?: string; fromSchedule?: boolean } | null
    if (state?.fromSchedule && state.sessionId) {
      setIsCollecting(true)
      setSessionId(state.sessionId)
      clearCollectData()
      clearCollectStat()
      clearLogs()
      addLog({
        type: 'info',
        message: `스케줄 즉시 실행으로 수집이 시작되었습니다. (세션 ID: ${state.sessionId.substring(0, 8)}...)`
      })
      // state 초기화 (뒤로가기 시 중복 실행 방지)
      window.history.replaceState({}, document.title)
    }
  }, [])

  const clearResults = () => {
    clearCollectData()
    clearCollectStat()
    clearLogs()
    clearSessionId()
    addLog({
      type: 'info',
      message: '수집 결과를 초기화 했습니다.'
    })
  }

  const exportResults = async () => {
    if (!currentSessionId) {
      addLog({
        type: 'error',
        message: '내보낼 세션이 선택되지 않았습니다. 먼저 데이터를 수집해주세요.'
      })
      return
    }

    const result = await window.$renderer.request<string | boolean>(
      IPC_KEYS.crawler.excel,
      currentSessionId
    )

    if (result) {
      addLog({
        type: 'success',
        message: '엑셀 파일로 내보내기 완료!'
      })
    }
  }

  const handleStartCollectClick = () => {
    // 모달 열기
    setIsSettingsModalOpen(true)
  }

  const handleStartCrawling = async () => {
    // 크롤링 시작 전 모든 데이터 초기화
    setIsCollecting(true)
    clearCollectData()
    clearCollectStat()
    clearLogs()

    // 설정을 파라미터로 전달 및 세션 ID 받기
    const result = await window.$renderer.request<{ success: boolean; sessionId?: string }>(
      IPC_KEYS.crawler.start,
      crawlerSettings
    )

    if (!result.success) {
      setIsCollecting(false)
    } else if (result.sessionId) {
      setSessionId(result.sessionId)
    }
  }

  const handleStopCollectClick = async () => {
    const result: boolean = await window.$renderer.request(IPC_KEYS.crawler.stop)
    setIsCollecting(!result)
  }

  return (
    <>
      {/* Hero Section - Instagram Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] p-[2px] mb-6 shadow-2xl animate-fade-in">
        <div className="relative bg-white rounded-3xl p-8 h-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] shadow-lg">
                  <Play className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] bg-clip-text text-transparent">
                    데이터 수집
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    네이버 증권에서 테마별 주가를 자동으로 수집합니다
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isCollecting ? (
                <Button
                  onClick={handleStartCollectClick}
                  size="lg"
                  className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border-0"
                >
                  <Play className="size-4 mr-2" />
                  수집 시작
                </Button>
              ) : (
                <Button
                  onClick={handleStopCollectClick}
                  size="lg"
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:opacity-90 shadow-lg border-0"
                >
                  <Square className="size-4 mr-2" />
                  수집 종료
                </Button>
              )}
              <Button
                onClick={exportResults}
                size="lg"
                variant="outline"
                className="border-2 border-[#833AB4]/30 text-[#833AB4] hover:bg-[#833AB4]/5 hover:border-[#833AB4] shadow-sm"
              >
                <Download className="size-4 mr-2" />
                내보내기
              </Button>
              <Button
                onClick={clearResults}
                size="lg"
                variant="outline"
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm"
              >
                <Trash2 className="size-4 mr-2" />
                초기화
              </Button>
            </div>
          </div>

          {/* Decorative Gradient Blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#833AB4]/20 to-[#FD1D1D]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#FCAF45]/20 to-[#E1306C]/20 rounded-full blur-2xl" />
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

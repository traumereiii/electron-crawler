import { useEffect, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Download, Play, Square, Trash2 } from 'lucide-react'
import LogWindow from '@renderer/components/collect/LogWindow'
import CollectResultTable from '@renderer/components/collect/CollectResultTable'
import { useAddLog } from '@renderer/store/log'
import PageTitle from '@renderer/components/PageTitle'
import { useClearCollectData } from '@renderer/store/collect-data'
import { IPC_KEYS } from '../../../lib/constant'

export default function IndexPage() {
  const [isCollecting, setIsCollecting] = useState(false)
  const [stats, setStats] = useState({ total: 6, success: 5, failed: 1 })
  const addLog = useAddLog()
  const clearCollectData = useClearCollectData()

  useEffect(() => {
    // scroll to top when page loads
    window.scrollTo(0, 0)
  }, [])

  const clearResults = () => {
    clearCollectData()
    setStats({ total: 0, success: 0, failed: 0 })
    addLog('수집 결과를 초기화했습니다.', 'info')
  }

  const exportResults = () => {
    addLog('수집 결과를 내보냅니다...', 'info')
    setTimeout(() => {
      addLog('CSV 파일로 내보내기 완료!', 'success')
    }, 500)
  }

  const handleStartCollectClick = () => {
    addLog('크롤링 수집을 시작합니다...', 'info')
    setIsCollecting(true)
    // 요청 보내기
    window.$renderer.sendToMain(IPC_KEYS.request.post.startCrawling, { message: 'test' })
  }

  const handleStopCollectClick = () => {
    addLog('크롤링 수집을 중지합니다...', 'info')
    setIsCollecting(false)
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 text-xl">전체 수집</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 text-xl">{stats.total}</div>
            <p className="text-slate-500 mt-1">건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 text-xl">성공</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-600 text-xl">{stats.success}</div>
            <p className="text-slate-500 mt-1">건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 text-xl">실패</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600 text-xl">{stats.failed}</div>
            <p className="text-slate-500 mt-1">건</p>
          </CardContent>
        </Card>
      </div>

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
    </>
  )
}

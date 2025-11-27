import { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './components/ui/table'
import { Badge } from './components/ui/badge'
import { ScrollArea } from './components/ui/scroll-area'
import { Play, Square, Download, Trash2, Database, History, Settings, Info } from 'lucide-react'

interface CrawlResult {
  id: string
  url: string
  title: string
  status: 'success' | 'failed'
  timestamp: string
}

interface LogEntry {
  id: string
  message: string
  type: 'info' | 'success' | 'error'
  timestamp: string
}

type MenuItem = 'collect' | 'history' | 'settings' | 'about'

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('collect')
  const [isCollecting, setIsCollecting] = useState(false)
  const [results, setResults] = useState<CrawlResult[]>([
    {
      id: '1',
      url: 'https://example.com/products/item-1',
      title: '상품 정보 - 프리미엄 노트북',
      status: 'success',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('ko-KR')
    },
    {
      id: '2',
      url: 'https://example.com/products/item-2',
      title: '상품 정보 - 무선 마우스',
      status: 'success',
      timestamp: new Date(Date.now() - 3000000).toLocaleString('ko-KR')
    },
    {
      id: '3',
      url: 'https://example.com/products/item-3',
      title: '상품 정보 - 기계식 키보드',
      status: 'failed',
      timestamp: new Date(Date.now() - 2400000).toLocaleString('ko-KR')
    },
    {
      id: '4',
      url: 'https://example.com/reviews/page-1',
      title: '리뷰 데이터 수집 완료',
      status: 'success',
      timestamp: new Date(Date.now() - 1800000).toLocaleString('ko-KR')
    },
    {
      id: '5',
      url: 'https://example.com/reviews/page-2',
      title: '리뷰 데이터 수집 완료',
      status: 'success',
      timestamp: new Date(Date.now() - 1200000).toLocaleString('ko-KR')
    },
    {
      id: '6',
      url: 'https://example.com/categories/electronics',
      title: '카테고리 정보 - 전자제품',
      status: 'success',
      timestamp: new Date(Date.now() - 600000).toLocaleString('ko-KR')
    }
  ])
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      message: '크롤링 시스템 초기화 완료',
      type: 'info',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-2',
      message: '✓ https://example.com/products/item-1 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 3500000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-3',
      message: '✓ https://example.com/products/item-2 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 3000000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-4',
      message: '✗ https://example.com/products/item-3 수집 실패 - 연결 오류',
      type: 'error',
      timestamp: new Date(Date.now() - 2400000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-5',
      message: '재시도 중...',
      type: 'info',
      timestamp: new Date(Date.now() - 2300000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-6',
      message: '✓ https://example.com/reviews/page-1 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-7',
      message: '✓ https://example.com/reviews/page-2 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 1200000).toLocaleTimeString('ko-KR')
    },
    {
      id: 'log-8',
      message: '✓ https://example.com/categories/electronics 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString('ko-KR')
    }
  ])
  const [stats, setStats] = useState({ total: 6, success: 5, failed: 1 })
  const logEndRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    { id: 'collect' as MenuItem, label: '데이터 수집', icon: Database },
    { id: 'history' as MenuItem, label: '데이터 수집 이력', icon: History },
    { id: 'settings' as MenuItem, label: '설정', icon: Settings },
    { id: 'about' as MenuItem, label: 'About', icon: Info }
  ]

  const addLog = (message: string, type: 'info' | 'success' | 'error') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString('ko-KR')
    }
    setLogs((prev) => [...prev, newLog])
  }

  const startCollection = () => {
    setIsCollecting(true)
    addLog('크롤링 수집을 시작합니다...', 'info')

    // 모의 크롤링 시작
    let count = 0
    const interval = setInterval(() => {
      if (count >= 10) {
        clearInterval(interval)
        setIsCollecting(false)
        addLog('크롤링 수집이 완료되었습니다.', 'success')
        return
      }

      const isSuccess = Math.random() > 0.2
      const newResult: CrawlResult = {
        id: Date.now().toString() + count,
        url: `https://example.com/page-${count + 1}`,
        title: `페이지 ${count + 1} - ${isSuccess ? '데이터 수집 완료' : '수집 실패'}`,
        status: isSuccess ? 'success' : 'failed',
        timestamp: new Date().toLocaleString('ko-KR')
      }

      setResults((prev) => [newResult, ...prev])
      setStats((prev) => ({
        total: prev.total + 1,
        success: prev.success + (isSuccess ? 1 : 0),
        failed: prev.failed + (isSuccess ? 0 : 1)
      }))

      if (isSuccess) {
        addLog(`✓ ${newResult.url} 수집 성공`, 'success')
      } else {
        addLog(`✗ ${newResult.url} 수집 실패 - 연결 오류`, 'error')
      }

      count++
    }, 1500)
  }

  const stopCollection = () => {
    setIsCollecting(false)
    addLog('크롤링 수집을 중지했습니다.', 'info')
  }

  const clearResults = () => {
    setResults([])
    setStats({ total: 0, success: 0, failed: 0 })
    addLog('수집 결과를 초기화했습니다.', 'info')
  }

  const exportResults = () => {
    addLog('수집 결과를 내보냅니다...', 'info')
    setTimeout(() => {
      addLog('CSV 파일로 내보내기 완료!', 'success')
    }, 500)
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const renderContent = () => {
    switch (activeMenu) {
      case 'collect':
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-900">크롤링 대시보드</h1>
                <p className="text-slate-600 mt-1">웹 데이터 수집 및 모니터링</p>
              </div>
              <div className="flex gap-3">
                {!isCollecting ? (
                  <Button
                    onClick={startCollection}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                  >
                    <Play className="size-4 mr-2" />
                    수집 시작
                  </Button>
                ) : (
                  <Button
                    onClick={stopCollection}
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
                  <CardTitle className="text-slate-600">전체 수집</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-900">{stats.total}</div>
                  <p className="text-slate-500 mt-1">건</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-600">성공</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-emerald-600">{stats.success}</div>
                  <p className="text-slate-500 mt-1">건</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-600">실패</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-red-600">{stats.failed}</div>
                  <p className="text-slate-500 mt-1">건</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Results Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>수집 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>시간</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                              수집된 데이터가 없습니다. 수집을 시작해주세요.
                            </TableCell>
                          </TableRow>
                        ) : (
                          results.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="max-w-[200px] truncate">{result.url}</TableCell>
                              <TableCell>{result.title}</TableCell>
                              <TableCell>
                                {result.status === 'success' ? (
                                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-100 hover:to-pink-100 border-0">
                                    성공
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-0">
                                    실패
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-slate-500">{result.timestamp}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>수집 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2 font-mono text-sm">
                      {logs.length === 0 ? (
                        <div className="text-slate-500 text-center py-12">로그가 없습니다.</div>
                      ) : (
                        logs.map((log) => (
                          <div
                            key={log.id}
                            className={`p-3 rounded-lg ${
                              log.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800'
                                : log.type === 'error'
                                  ? 'bg-red-50 text-red-800'
                                  : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                              <span className="break-all">{log.message}</span>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={logEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
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

      case 'history':
        return (
          <Card>
            <CardHeader>
              <CardTitle>데이터 수집 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-24 text-slate-500">
                <History className="size-16 mx-auto mb-4 opacity-20" />
                <p>과거 수집 이력을 조회할 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-slate-900 mb-2">크롤링 설정</h3>
                  <p className="text-slate-600">수집 간격, 타임아웃 등을 설정할 수 있습니다.</p>
                </div>
                <div className="text-center py-12 text-slate-500">
                  <Settings className="size-16 mx-auto mb-4 opacity-20" />
                  <p>설정 페이지 준비 중입니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'about':
        return (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-900 mb-2">크롤링 대시보드 v1.0</h3>
                  <p className="text-slate-600">웹 데이터 수집 및 모니터링 도구</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-slate-600">
                    이 대시보드는 웹사이트에서 데이터를 수집하고 실시간으로 모니터링할 수 있는
                    도구입니다.
                  </p>
                </div>
                <div className="text-center py-12 text-slate-500">
                  <Info className="size-16 mx-auto mb-4 opacity-20" />
                  <p>© 2024 크롤링 대시보드</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white p-6 flex flex-col m-6 mr-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <h2 className="text-gray-900">Crawler</h2>
          <p className="text-gray-400 mt-1">Dashboard</p>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-gray-400 text-sm">v1.0.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pr-6">
        <div className="max-w-7xl mx-auto space-y-5">{renderContent()}</div>
      </div>
    </div>
  )
}

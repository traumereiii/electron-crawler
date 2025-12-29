import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import type { CollectSession } from '@/types'
import { Button } from '@renderer/components/ui/button'
import { IPC_KEYS } from '@/lib/constant'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'

interface SessionDetailProps {
  session: CollectSession | null
}

interface CollectTask {
  id: string
  sessionId: string
  parentId: string | null
  url: string
  success: boolean
  screenshot: string | null
  startedAt: string
  spentTimeOnNavigateInMillis: number
  spentTimeOnPageLoadedInMillis: number
  error: string | null
  errorType: string | null
}

interface Parsing {
  id: string
  collectTask: string
  url: string
  success: boolean
  error: string | null
  errorType: string | null
  createdAt: string
}

export default function SessionDetail({ session }: SessionDetailProps) {
  const [tasks, setTasks] = useState<CollectTask[]>([])
  const [parsings, setParsings] = useState<Parsing[]>([])

  useEffect(() => {
    if (session) {
      // 작업 내역 가져오기
      window.$renderer
        .request<CollectTask[]>(IPC_KEYS.history.getTasks, { sessionId: session.id })
        .then((data) => setTasks(data))

      // 파싱 현황 가져오기
      window.$renderer
        .request<Parsing[]>(IPC_KEYS.history.getParsings, { sessionId: session.id })
        .then((data) => setParsings(data))
    }
  }, [session])

  const handleExportClick = async () => {
    await window.$renderer.request<string | boolean>(IPC_KEYS.crawler.excel, session?.id)
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>세션 상세 정보</CardTitle>
          {session && (
            <Button variant="outline" size="sm" onClick={handleExportClick}>
              내보내기
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!session ? (
          <div className="text-center py-8 text-slate-500">
            세션을 선택하면 상세 정보가 표시됩니다.
          </div>
        ) : (
          <div className="space-y-4">
            {/* 세션 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-600 text-sm">엔트리 URL</p>
                <p className="text-slate-900 mt-1">{session.entryUrl}</p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">시작 시간</p>
                <p className="text-slate-900 mt-1">
                  {new Date(session.startedAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl">
                <p className="text-slate-600 text-sm">전체 작업</p>
                <p className="text-slate-900 mt-1">{session.totalTasks}건</p>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-slate-600 text-sm">성공</p>
                <p className="text-emerald-600 mt-1">{session.successTasks}건</p>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-slate-600 text-sm">실패</p>
                <p className="text-red-600 mt-1">{session.failedTasks}건</p>
              </div>
            </div>

            {/* 탭 구조 */}
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="bg-white border border-gray-100 rounded-xl">
                <TabsTrigger
                  value="tasks"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  작업 내역 ({tasks.length})
                </TabsTrigger>
                <TabsTrigger
                  value="parsing"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  파싱 현황 ({parsings.length})
                </TabsTrigger>
              </TabsList>

              {/* 작업 내역 탭 */}
              <TabsContent value="tasks" className="mt-4">
                <div className="bg-white rounded-xl max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">상태</TableHead>
                        <TableHead className="text-center">네비게이션 시간</TableHead>
                        <TableHead className="text-center">로드 시간</TableHead>
                        <TableHead>에러 타입</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="max-w-[300px] truncate">{task.url}</TableCell>
                          <TableCell className="text-center">
                            {task.success ? (
                              <CheckCircle2 className="size-5 text-emerald-600 mx-auto" />
                            ) : (
                              <XCircle className="size-5 text-red-600 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center text-slate-600">
                            {task.spentTimeOnNavigateInMillis}ms
                          </TableCell>
                          <TableCell className="text-center text-slate-600">
                            {task.spentTimeOnPageLoadedInMillis}ms
                          </TableCell>
                          <TableCell>
                            {task.errorType ? (
                              <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0">
                                {task.errorType}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-slate-500">작업 내역이 없습니다.</div>
                  )}
                </div>
              </TabsContent>

              {/* 파싱 현황 탭 */}
              <TabsContent value="parsing" className="mt-4">
                <div className="bg-white rounded-xl max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">상태</TableHead>
                        <TableHead>에러 타입</TableHead>
                        <TableHead>에러 메시지</TableHead>
                        <TableHead>생성 시간</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsings.map((parsing) => (
                        <TableRow key={parsing.id}>
                          <TableCell className="max-w-[300px] truncate">{parsing.url}</TableCell>
                          <TableCell className="text-center">
                            {parsing.success ? (
                              <CheckCircle2 className="size-5 text-emerald-600 mx-auto" />
                            ) : (
                              <XCircle className="size-5 text-red-600 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell>
                            {parsing.errorType ? (
                              <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0">
                                {parsing.errorType}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-slate-600">
                            {parsing.error || '-'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {new Date(parsing.createdAt).toLocaleString('ko-KR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {parsings.length === 0 && (
                    <div className="text-center py-8 text-slate-500">파싱 현황이 없습니다.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

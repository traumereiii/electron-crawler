import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import type { CollectSession } from '@/types'
import { Button } from '@renderer/components/ui/button'
import { IPC_KEYS } from '@/lib/constant'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useEffect, useState } from 'react'
import SessionInfo from '@renderer/components/history/SessionInfo'
import SessionStats from '@renderer/components/history/SessionStats'
import TaskHistoryTable from '@renderer/components/history/TaskHistoryTable'
import ParsingTable from '@renderer/components/history/ParsingTable'
import ScreenshotModal from '@renderer/components/history/ScreenshotModal'

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
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false)

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

  const handleTaskRowClick = (task: CollectTask) => {
    if (task.screenshot) {
      setSelectedScreenshot(task.screenshot)
      setIsScreenshotModalOpen(true)
    }
  }

  return (
    <>
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
              <SessionInfo session={session} />

              {/* 통계 카드 */}
              <SessionStats session={session} />

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
                  <TaskHistoryTable tasks={tasks} onRowClick={handleTaskRowClick} />
                </TabsContent>

                {/* 파싱 현황 탭 */}
                <TabsContent value="parsing" className="mt-4">
                  <ParsingTable parsings={parsings} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 스크린샷 모달 */}
      <ScreenshotModal
        screenshot={selectedScreenshot}
        open={isScreenshotModalOpen}
        onOpenChange={setIsScreenshotModalOpen}
      />
    </>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { CollectSession } from '@/types'
import { useCollectTasks } from '@renderer/store/history/collect-task'
import { formatDateToKoreanString } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { IPC_KEYS } from '@/lib/constant'

interface SessionDetailProps {
  session: CollectSession | null
  // onClose: () => void
}

export default function SessionDetail({ session }: SessionDetailProps) {
  // const [tasks, setTasks] = useState<CollectTask[]>([])
  const collectTasks = useCollectTasks()

  const handleExportClick = async () => {
    const result = await window.$renderer.request<string | boolean>(
      IPC_KEYS.crawler.excel,
      session?.id
    )
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>세션 상세 정보</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportClick}>
            내보내기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(() => {
          if (!session) return null
          //const sessionTasks = collectTasks.filter((t) => t.collectId === selectedSession)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-600 text-sm">엔트리 URL</p>
                  <p className="text-slate-900 mt-1">{session.entryUrl}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">시작 시간</p>
                  <p className="text-slate-900 mt-1">{session.startedAt}</p>
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
              {
                <div>
                  <p className="text-slate-900 mb-2">이 세션의 작업 ({session.totalTasks}건)</p>
                  <div className="bg-white rounded-xl p-4 space-y-2 max-h-[1000px] overflow-y-auto">
                    {collectTasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex-1 truncate">
                          <p className="text-slate-900 text-sm truncate">{task.url}</p>
                          <p className="text-slate-500 text-xs">
                            {formatDateToKoreanString(task.startedAt)}
                          </p>
                        </div>
                        {task.success ? (
                          <CheckCircle2 className="size-5 text-emerald-600 ml-2" />
                        ) : (
                          <XCircle className="size-5 text-red-600 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              }
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}

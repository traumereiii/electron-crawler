import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import {
  useAddSession,
  useClearCollectSessions,
  useCollectSessions
} from '@renderer/store/history/collect-session'
import type { CollectSession } from '@/types'
import { useEffect } from 'react'
import { IPC_KEYS } from '@/lib/constant'

interface SessionTableProps {
  onRowClick: (session: CollectSession) => void
}

export default function SessionTable({ onRowClick }: SessionTableProps) {
  const collectSessions = useCollectSessions()
  const addSession = useAddSession()
  const clearCollectSessions = useClearCollectSessions()

  useEffect(() => {
    window.$renderer.request<CollectSession[]>(IPC_KEYS.history.getSessions).then((sessions) => {
      clearCollectSessions()
      sessions.forEach((session) => addSession(session))
    })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>수집 세션 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시작 시간</TableHead>
                <TableHead>엔트리 URL</TableHead>
                <TableHead className="text-center">전체 작업</TableHead>
                <TableHead className="text-center">성공</TableHead>
                <TableHead className="text-center">실패</TableHead>
                <TableHead className="text-center">성공률</TableHead>
                <TableHead>상태</TableHead>
                {/*<TableHead className="text-center">액션</TableHead>*/}
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectSessions.map((session, index) => {
                const successRate =
                  session.totalTasks !== 0
                    ? ((session.successTasks / session.totalTasks) * 100).toFixed(1)
                    : '0'
                return (
                  <TableRow
                    key={index}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onRowClick(session)}
                  >
                    <TableCell className="text-slate-600">
                      {new Date(session.startedAt).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{session.entryUrl}</TableCell>
                    <TableCell className="text-center">{session.totalTasks}</TableCell>
                    <TableCell className="text-center text-emerald-600">
                      {session.successTasks}
                    </TableCell>
                    <TableCell className="text-center text-red-600">
                      {session.failedTasks}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`${parseFloat(successRate) >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}
                      >
                        {successRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {session.status === 'COMPLETED' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                          완료
                        </Badge>
                      ) : session.status === 'IN_PROGRESS' ? (
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0">
                          진행 중
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-0">
                          실패
                        </Badge>
                      )}
                    </TableCell>
                    {/*<TableCell className="text-center">*/}
                    {/*  <Button*/}
                    {/*    variant="ghost"*/}
                    {/*    size="sm"*/}
                    {/*    className="hover:bg-purple-50 hover:text-purple-600"*/}
                    {/*  >*/}
                    {/*    <Eye className="size-4" />*/}
                    {/*  </Button>*/}
                    {/*</TableCell>*/}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

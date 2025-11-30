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
import {
  useAddCollectTask,
  useClearCollectTasks,
  useCollectTasks
} from '@renderer/store/history/collect-task'
import { useEffect } from 'react'
import { IPC_KEYS } from '@/lib/constant'
import { CollectTask } from '@/types'
import { Badge } from '@renderer/components/ui/badge'
import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { formatDateToKoreanString } from '@renderer/lib/utils'

interface TaskTableProps {
  onRowClick: (task: CollectTask) => void
}

export default function TaskTable({ onRowClick }: TaskTableProps) {
  const collectTasks = useCollectTasks()
  const addCollectTask = useAddCollectTask()
  const clearCollectTasks = useClearCollectTasks()

  useEffect(() => {
    window.$renderer.request<CollectTask[]>(IPC_KEYS.history.getTasks).then((tasks) => {
      clearCollectTasks()
      tasks.forEach((task) => addCollectTask(task))
    })
  }, [])

  const handleSessionClick = (task: CollectTask) => {
    console.log('handleSessionClick: ', task)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>URL 작업 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="text-center">성공</TableHead>
                <TableHead className="text-center">네비게이션 (ms)</TableHead>
                <TableHead className="text-center">로드 (ms)</TableHead>
                <TableHead>시작 시간</TableHead>
                <TableHead>에러 타입</TableHead>
                <TableHead className="text-center">세션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectTasks.map((task, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onRowClick(task)}
                >
                  <TableCell className="max-w-[300px] truncate">{task.url}</TableCell>
                  <TableCell className="text-center">
                    {task.success ? (
                      <CheckCircle2 className="size-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="size-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center text-slate-600">
                    {task.spentTimeOnNavigateInMillis}
                  </TableCell>
                  <TableCell className="text-center text-slate-600">
                    {task.spentTimeOnPageLoadedInMillis}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDateToKoreanString(task.startedAt)}
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
                  <TableCell className="text-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSessionClick(task)
                      }}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-purple-50 hover:text-purple-600"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { CheckCircle2, Image as ImageIcon, XCircle } from 'lucide-react'

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

interface TaskHistoryTableProps {
  tasks: CollectTask[]
  onRowClick: (task: CollectTask) => void
}

export default function TaskHistoryTable({ tasks, onRowClick }: TaskHistoryTableProps) {
  return (
    <div className="bg-white rounded-xl max-h-[400px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead className="text-center">네비게이션 시간</TableHead>
            <TableHead className="text-center">로드 시간</TableHead>
            <TableHead className="text-center">스크린샷</TableHead>
            <TableHead>에러 타입</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              onClick={() => onRowClick(task)}
              className={task.screenshot ? 'cursor-pointer hover:bg-gray-50' : ''}
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
                {task.spentTimeOnNavigateInMillis}ms
              </TableCell>
              <TableCell className="text-center text-slate-600">
                {task.spentTimeOnPageLoadedInMillis}ms
              </TableCell>
              <TableCell className="text-center">
                {task.screenshot ? (
                  <ImageIcon className="size-5 text-blue-600 mx-auto" />
                ) : (
                  <span className="text-slate-400">-</span>
                )}
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
  )
}

import { Button } from '@renderer/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { Bell, Edit, FileDown, Power, PowerOff, Trash2, Zap } from 'lucide-react'
import { Schedule } from './types'
import { formatPeriodText } from './utils'

interface ScheduleTableProps {
  schedules: Schedule[]
  onView: (scheduleId: string) => void
  onEdit: (schedule: Schedule) => void
  onToggle: (scheduleId: string) => void
  onExecute: (scheduleId: string) => void
  onDelete: (scheduleId: string) => void
}

export function ScheduleTable({
  schedules,
  onView,
  onEdit,
  onToggle,
  onExecute,
  onDelete
}: ScheduleTableProps) {
  const handleToggle = (e: React.MouseEvent, scheduleId: string, enabled: boolean) => {
    e.stopPropagation()
    const action = enabled ? '비활성화' : '활성화'
    if (window.confirm(`스케줄을 ${action}하시겠습니까?`)) {
      onToggle(scheduleId)
    }
  }

  const handleExecute = (e: React.MouseEvent, scheduleId: string, scheduleName: string) => {
    e.stopPropagation()
    if (window.confirm(`'${scheduleName}' 스케줄을 즉시 실행하시겠습니까?`)) {
      onExecute(scheduleId)
    }
  }

  const handleDelete = (e: React.MouseEvent, scheduleId: string, scheduleName: string) => {
    e.stopPropagation()
    if (
      window.confirm(`'${scheduleName}' 스케줄을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      onDelete(scheduleId)
    }
  }

  const handleEdit = (e: React.MouseEvent, schedule: Schedule) => {
    e.stopPropagation()
    onEdit(schedule)
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>스케줄명</TableHead>
          <TableHead>실행 주기</TableHead>
          <TableHead>다음 실행</TableHead>
          <TableHead>마지막 실행</TableHead>
          <TableHead className="text-center">상태</TableHead>
          <TableHead className="text-center">수집 후 동작</TableHead>
          <TableHead className="text-center">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => {
          const periodText = formatPeriodText(schedule)

          return (
            <TableRow
              key={schedule.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onView(schedule.id)}
            >
              <TableCell>
                <div>
                  <p className="text-slate-900">{schedule.name}</p>
                  <p className="text-slate-500 text-sm">{schedule.description}</p>
                </div>
              </TableCell>
              <TableCell className="text-slate-600">{periodText}</TableCell>
              <TableCell className="text-slate-600">{schedule.nextRun}</TableCell>
              <TableCell className="text-slate-600">{schedule.lastRun}</TableCell>
              <TableCell className="text-center">
                {schedule.enabled ? (
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                    활성
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">
                    비활성
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  {schedule.postActions.notification && (
                    <div className="p-1.5 bg-purple-50 rounded-lg" title="알림 전송">
                      <Bell className="size-4 text-purple-600" />
                    </div>
                  )}
                  {schedule.postActions.autoExport && (
                    <div className="p-1.5 bg-emerald-50 rounded-lg" title="자동 내보내기">
                      <FileDown className="size-4 text-emerald-600" />
                    </div>
                  )}
                  {!schedule.postActions.notification && !schedule.postActions.autoExport && (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEdit(e, schedule)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                    title="수정"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleToggle(e, schedule.id, schedule.enabled)}
                    className="hover:bg-amber-50 hover:text-amber-600"
                    title={schedule.enabled ? '비활성화' : '활성화'}
                  >
                    {schedule.enabled ? (
                      <PowerOff className="size-4" />
                    ) : (
                      <Power className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleExecute(e, schedule.id, schedule.name)}
                    className="hover:bg-emerald-50 hover:text-emerald-600"
                    title="즉시 실행"
                  >
                    <Zap className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, schedule.id, schedule.name)}
                    className="hover:bg-red-50 hover:text-red-600"
                    title="삭제"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

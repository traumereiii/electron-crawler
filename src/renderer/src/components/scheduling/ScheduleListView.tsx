import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { Schedule } from './types'
import { ScheduleSummaryCards } from './ScheduleSummaryCards'
import { ScheduleTable } from './ScheduleTable'
import { useNavigate } from 'react-router'

interface ScheduleListViewProps {
  schedules: Schedule[]
  onToggle: (scheduleId: string) => void
  onDelete: (scheduleId: string) => void
}

export function ScheduleListView({ schedules, onToggle, onDelete }: ScheduleListViewProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900">수집 스케줄링 설정</h1>
          <p className="text-slate-600 mt-1">자동 수집 스케줄 관리</p>
        </div>
        <Button
          onClick={() => navigate('/collect-schedule/form')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
        >
          <Plus className="size-4 mr-2" />새 스케줄 추가
        </Button>
      </div>

      {/* Summary Cards */}
      <ScheduleSummaryCards schedules={schedules} />

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>스케줄 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <ScheduleTable schedules={schedules} onToggle={onToggle} onDelete={onDelete} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

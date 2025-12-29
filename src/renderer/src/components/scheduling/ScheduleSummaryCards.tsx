import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { CalendarClock, Clock, Power, PowerOff } from 'lucide-react'
import { Schedule } from './types'

interface ScheduleSummaryCardsProps {
  schedules: Schedule[]
}

export function ScheduleSummaryCards({ schedules }: ScheduleSummaryCardsProps) {
  const activeSchedules = schedules.filter((s) => s.enabled).length
  const inactiveSchedules = schedules.filter((s) => !s.enabled).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <CalendarClock className="size-4" />
            전체 스케줄
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-900">{schedules.length}</div>
          <p className="text-slate-500 mt-1">개</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <Power className="size-4" />
            활성화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-emerald-600">{activeSchedules}</div>
          <p className="text-slate-500 mt-1">개</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <PowerOff className="size-4" />
            비활성화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600">{inactiveSchedules}</div>
          <p className="text-slate-500 mt-1">개</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <Clock className="size-4" />
            다음 실행
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-purple-600 text-sm">1시간 후</div>
          <p className="text-slate-500 mt-1">예정</p>
        </CardContent>
      </Card>
    </div>
  )
}

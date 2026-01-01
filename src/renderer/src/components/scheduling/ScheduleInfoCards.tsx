import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import { Schedule } from './types'
import { formatPeriodText } from './utils'

interface ScheduleInfoCardsProps {
  schedule: Schedule
}

export function ScheduleInfoCards({ schedule }: ScheduleInfoCardsProps) {
  const periodText = formatPeriodText(schedule)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 스케줄 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>스케줄 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-slate-600 text-sm">실행 주기</p>
            <p className="text-slate-900 mt-1">{periodText}</p>
          </div>
          {/*<div className="border-t border-gray-100 pt-3">*/}
          {/*  <p className="text-slate-600 text-sm">수집 대상</p>*/}
          {/*  <p className="text-slate-900 mt-1">*/}
          {/*    {schedule.target === 'all' && '전체 사이트'}*/}
          {/*    {schedule.target === 'specific' && schedule.targetValue}*/}
          {/*    {schedule.target === 'master' && `Master: ${schedule.targetValue}`}*/}
          {/*  </p>*/}
          {/*</div>*/}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-slate-600 text-sm">상태</p>
            <div className="mt-1">
              {schedule.enabled ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-0">활성</Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 border-0">비활성</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 실행 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>실행 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-slate-600 text-sm">마지막 실행</p>
            <p className="text-slate-900 mt-1">{schedule.lastRun}</p>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-slate-600 text-sm">다음 실행 예정</p>
            <p className="text-purple-600 mt-1">{schedule.nextRun}</p>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-slate-600 text-sm">생성일</p>
            <p className="text-slate-900 mt-1">{schedule.createdAt}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

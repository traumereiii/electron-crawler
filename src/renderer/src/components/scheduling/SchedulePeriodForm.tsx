import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

interface SchedulePeriodFormProps {
  type: 'daily' | 'weekly' | 'monthly' | 'cron'
  time: string
  weekdays?: number[]
  dayOfMonth?: number
  cronExpression?: string
  onChange: (updates: Partial<SchedulePeriodFormProps>) => void
}

export function SchedulePeriodForm({
  type,
  time,
  weekdays,
  dayOfMonth,
  cronExpression,
  onChange
}: SchedulePeriodFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>실행 주기 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-slate-900 text-sm mb-2 block">주기 타입</label>
          <Select value={type} onValueChange={(v: any) => onChange({ type: v })}>
            <SelectTrigger className="border-gray-200 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">매일 실행</SelectItem>
              <SelectItem value="weekly">매주 실행</SelectItem>
              <SelectItem value="monthly">매월 실행</SelectItem>
              <SelectItem value="cron">CRON (고급)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === 'daily' && (
          <div>
            <label className="text-slate-900 text-sm mb-2 block">실행 시각</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => onChange({ time: e.target.value })}
              className="border-gray-200 rounded-xl"
            />
          </div>
        )}

        {type === 'weekly' && (
          <>
            <div>
              <label className="text-slate-900 text-sm mb-2 block">요일 선택</label>
              <div className="flex gap-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const current = weekdays || []
                      if (current.includes(idx)) {
                        onChange({ weekdays: current.filter((d) => d !== idx) })
                      } else {
                        onChange({ weekdays: [...current, idx] })
                      }
                    }}
                    className={`flex-1 py-2 rounded-lg border transition-all ${
                      weekdays?.includes(idx)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                        : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-slate-900 text-sm mb-2 block">실행 시각</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => onChange({ time: e.target.value })}
                className="border-gray-200 rounded-xl"
              />
            </div>
          </>
        )}

        {type === 'monthly' && (
          <>
            <div>
              <label className="text-slate-900 text-sm mb-2 block">실행 날짜</label>
              <Select
                value={dayOfMonth?.toString()}
                onValueChange={(v) => onChange({ dayOfMonth: parseInt(v) })}
              >
                <SelectTrigger className="border-gray-200 rounded-xl">
                  <SelectValue placeholder="날짜 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}일
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-900 text-sm mb-2 block">실행 시각</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => onChange({ time: e.target.value })}
                className="border-gray-200 rounded-xl"
              />
            </div>
          </>
        )}

        {type === 'cron' && (
          <div>
            <label className="text-slate-900 text-sm mb-2 block">CRON 표현식</label>
            <Input
              placeholder="0 2 * * *"
              value={cronExpression}
              onChange={(e) => onChange({ cronExpression: e.target.value })}
              className="border-gray-200 rounded-xl"
            />
            <p className="text-slate-500 text-xs mt-1">형식: 분 시 일 월 요일</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

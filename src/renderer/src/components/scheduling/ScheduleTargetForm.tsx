import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

interface ScheduleTargetFormProps {
  target: 'all' | 'specific' | 'master'
  targetValue?: string
  onChange: (updates: { target?: 'all' | 'specific' | 'master'; targetValue?: string }) => void
}

export function ScheduleTargetForm({ target, targetValue, onChange }: ScheduleTargetFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>수집 대상 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-slate-900 text-sm mb-2 block">대상 타입</label>
          <Select value={target} onValueChange={(v: any) => onChange({ target: v })}>
            <SelectTrigger className="border-gray-200 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 사이트</SelectItem>
              <SelectItem value="specific">특정 URL</SelectItem>
              <SelectItem value="master">Master 기준</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {target === 'specific' && (
          <div>
            <label className="text-slate-900 text-sm mb-2 block">URL</label>
            <Input
              placeholder="https://example.com"
              value={targetValue}
              onChange={(e) => onChange({ targetValue: e.target.value })}
              className="border-gray-200 rounded-xl"
            />
          </div>
        )}

        {target === 'master' && (
          <div>
            <label className="text-slate-900 text-sm mb-2 block">Master 값</label>
            <Input
              placeholder="naver-products"
              value={targetValue}
              onChange={(e) => onChange({ targetValue: e.target.value })}
              className="border-gray-200 rounded-xl"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

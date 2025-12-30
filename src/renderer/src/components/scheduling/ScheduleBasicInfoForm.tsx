import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'

interface ScheduleBasicInfoFormProps {
  name: string
  description?: string
  onChange: (field: 'name' | 'description', value: string) => void
}

export function ScheduleBasicInfoForm({ name, description, onChange }: ScheduleBasicInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-slate-900 text-sm mb-2 block">스케줄 이름 *</label>
          <Input
            placeholder="예: 오전 데이터 수집"
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            className="border-gray-200 rounded-xl"
          />
        </div>
        <div>
          <label className="text-slate-900 text-sm mb-2 block">설명 (선택)</label>
          <Input
            placeholder="보고용 데이터 수집"
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
            className="border-gray-200 rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  )
}

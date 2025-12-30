import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Button } from '@renderer/components/ui/button'
import { Database } from 'lucide-react'

export interface DatabaseSettingsValues {
  dbPath: string
}

interface DatabaseSettingsProps {
  values: DatabaseSettingsValues
  onUpdate: <K extends keyof DatabaseSettingsValues>(
    key: K,
    value: DatabaseSettingsValues[K]
  ) => void
}

export default function DatabaseSettings({ values }: DatabaseSettingsProps) {
  return (
    <Card className="shadow-lg border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Database className="size-6 text-brand-purple-600" />
          데이터베이스 설정
        </CardTitle>
        <CardDescription>데이터베이스 관리 및 설정</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-body-md">데이터베이스 경로</Label>
          <div className="p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-700">
            {values.dbPath}
          </div>
          <p className="text-body-sm text-slate-500">현재 사용 중인 데이터베이스 경로</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</h4>
          <p className="text-body-sm text-amber-800">
            데이터베이스를 정리하면 모든 수집 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
            없습니다.
          </p>
        </div>

        <Button variant="destructive" className="w-full" disabled>
          <Database className="size-4 mr-2" />
          데이터베이스 정리 (준비 중)
        </Button>
      </CardContent>
    </Card>
  )
}

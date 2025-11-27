import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-2">크롤링 설정</h3>
            <p className="text-slate-600">수집 간격, 타임아웃 등을 설정할 수 있습니다.</p>
          </div>
          <div className="text-center py-12 text-slate-500">
            <Settings className="size-16 mx-auto mb-4 opacity-20" />
            <p>설정 페이지 준비 중입니다.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

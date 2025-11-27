import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { History } from 'lucide-react'

export default function CollectHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>데이터 수집 이력</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-24 text-slate-500">
          <History className="size-16 mx-auto mb-4 opacity-20" />
          <p>과거 수집 이력을 조회할 수 있습니다.</p>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Info } from 'lucide-react'

export default function AboutPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-slate-900 mb-2">크롤링 대시보드 v1.0</h3>
            <p className="text-slate-600">웹 데이터 수집 및 모니터링 도구</p>
          </div>
          <div className="border-t pt-4">
            <p className="text-slate-600">
              이 대시보드는 웹사이트에서 데이터를 수집하고 실시간으로 모니터링할 수 있는 도구입니다.
            </p>
          </div>
          <div className="text-center py-12 text-slate-500">
            <Info className="size-16 mx-auto mb-4 opacity-20" />
            <p>© 2024 크롤링 대시보드</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

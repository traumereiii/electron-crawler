import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useStatStore } from '@renderer/store/collect/collect-stat'
import { useEffect } from 'react'
import { IPC_KEYS } from '../../../../lib/constant'
import { Database, CheckCircle2, XCircle } from 'lucide-react'

export default function StatWindow() {
  const store = useStatStore()
  useEffect(() => {
    window.$renderer.onReceive(IPC_KEYS.crawler.stat, (_event, stat) => {
      store.actions.addStat(stat)
    })
  }, [])

  const successRate = store.total > 0 ? (store.success / store.total) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
      {/* Total Card */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-600 text-base font-medium">전체 수집</CardTitle>
            <div className="p-2 bg-brand-purple-100 rounded-lg">
              <Database className="size-4 text-brand-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold bg-gradient-to-br from-brand-purple-600 to-brand-pink-600 bg-clip-text text-transparent">
            {store.total}
          </div>
          <p className="text-slate-500 text-sm mt-1">건</p>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((store.total / 1000) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Success Card */}
      <Card className="bg-gradient-to-br from-white to-emerald-50/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-600 text-base font-medium">성공</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-emerald-600">{store.success}</div>
          <p className="text-slate-500 text-sm mt-1">건</p>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fail Card */}
      <Card className="bg-gradient-to-br from-white to-red-50/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-600 text-base font-medium">실패</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="size-4 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-red-600">{store.fail}</div>
          <p className="text-slate-500 text-sm mt-1">건</p>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${store.total > 0 ? (store.fail / store.total) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

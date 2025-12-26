import { Card, CardContent } from '@renderer/components/ui/card'
import { useStatStore } from '@renderer/store/collect/collect-stat'
import { useEffect } from 'react'
import { IPC_KEYS } from '../../../../lib/constant'
import { CheckCircle2, Database, XCircle } from 'lucide-react'

export default function StatWindow() {
  const store = useStatStore()
  useEffect(() => {
    window.$renderer.onReceive(IPC_KEYS.crawler.stat, (_event, stat) => {
      store.actions.addStat(stat)
    })
  }, [])

  const successRate = store.total > 0 ? (store.success / store.total) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-slide-up">
      {/* Total Card - Instagram Purple */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#833AB4] to-[#5B51D8] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Database className="size-8 text-white" />
            </div>
            {/* Count */}
            <div className="text-5xl font-bold text-white mb-2">{store.total}</div>
            {/* Label */}
            <p className="text-white/80 text-sm font-medium">전체 수집</p>
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${Math.min((store.total / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
          {/* Decorative Blur */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </CardContent>
      </Card>

      {/* Success Card - Instagram Pink */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#E1306C] to-[#FD1D1D] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            {/* Count */}
            <div className="text-5xl font-bold text-white mb-2">{store.success}</div>
            {/* Label */}
            <p className="text-white/80 text-sm font-medium">성공</p>
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
          {/* Decorative Blur */}
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </CardContent>
      </Card>

      {/* Fail Card - Instagram Orange */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#F77737] to-[#FCAF45] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <XCircle className="size-8 text-white" />
            </div>
            {/* Count */}
            <div className="text-5xl font-bold text-white mb-2">{store.fail}</div>
            {/* Label */}
            <p className="text-white/80 text-sm font-medium">실패</p>
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${store.total > 0 ? (store.fail / store.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          {/* Decorative Blur */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </CardContent>
      </Card>
    </div>
  )
}

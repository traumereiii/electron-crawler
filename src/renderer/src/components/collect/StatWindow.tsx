import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useStatStore } from '@renderer/store/collect-stat'
import { useEffect } from 'react'
import { IPC_KEYS } from '../../../../lib/constant'

export default function StatWindow() {
  const store = useStatStore()
  useEffect(() => {
    window.$renderer.onReceive(IPC_KEYS.crawler.stat, (_event, stat) => {
      store.actions.addStat(stat)
    })
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 text-xl">전체 수집</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-900 text-xl">{store.total}</div>
          <p className="text-slate-500 mt-1">건</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 text-xl">성공</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-emerald-600 text-xl">{store.success}</div>
          <p className="text-slate-500 mt-1">건</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-600 text-xl">실패</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-xl">{store.fail}</div>
          <p className="text-slate-500 mt-1">건</p>
        </CardContent>
      </Card>
    </div>
  )
}

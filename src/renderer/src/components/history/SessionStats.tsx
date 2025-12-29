import type { CollectSession } from '@/types'

interface SessionStatsProps {
  session: CollectSession
}

export default function SessionStats({ session }: SessionStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl">
        <p className="text-slate-600 text-sm">전체 작업</p>
        <p className="text-slate-900 mt-1">{session.totalTasks}건</p>
      </div>
      <div className="bg-white p-4 rounded-xl">
        <p className="text-slate-600 text-sm">성공</p>
        <p className="text-emerald-600 mt-1">{session.successTasks}건</p>
      </div>
      <div className="bg-white p-4 rounded-xl">
        <p className="text-slate-600 text-sm">실패</p>
        <p className="text-red-600 mt-1">{session.failedTasks}건</p>
      </div>
    </div>
  )
}

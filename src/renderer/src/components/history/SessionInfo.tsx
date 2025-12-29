import type { CollectSession } from '@/types'

interface SessionInfoProps {
  session: CollectSession
}

export default function SessionInfo({ session }: SessionInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-slate-600 text-sm">엔트리 URL</p>
        <p className="text-slate-900 mt-1">{session.entryUrl}</p>
      </div>
      <div>
        <p className="text-slate-600 text-sm">시작 시간</p>
        <p className="text-slate-900 mt-1">{new Date(session.startedAt).toLocaleString('ko-KR')}</p>
      </div>
    </div>
  )
}

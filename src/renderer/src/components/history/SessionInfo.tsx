import type { CollectSession } from '@/types'

interface SessionInfoProps {
  session: CollectSession
}

const EXECUTION_TYPE_LABELS: Record<CollectSession['executionType'], string> = {
  MANUAL: '사용자',
  SCHEDULED_AUTO: '스케줄러_자동',
  SCHEDULED_IMMEDIATE: '스케줄러_즉시실행'
}

export default function SessionInfo({ session }: SessionInfoProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">엔트리 URL</p>
          <p className="text-slate-900 font-medium">{session.entryUrl}</p>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">실행 타입</p>
          <p className="text-slate-900 font-medium">{EXECUTION_TYPE_LABELS[session.executionType]}</p>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">시작 시간</p>
          <p className="text-slate-900 font-medium">
            {new Date(session.startedAt).toLocaleString('ko-KR')}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">종료 시간</p>
          <p className="text-slate-900 font-medium">
            {session.finishedAt
              ? new Date(session.finishedAt).toLocaleString('ko-KR')
              : '진행 중'}
          </p>
        </div>
      </div>
    </div>
  )
}

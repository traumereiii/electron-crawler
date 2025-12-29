import SessionTab from '@renderer/components/history/session-tab/SessionTab'

export default function CollectHistoryPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900">데이터 수집 이력</h1>
          <p className="text-slate-600 mt-1">세션별 수집 현황 및 상세 정보</p>
        </div>
      </div>

      {/* Session Tab Content */}
      <SessionTab />
    </div>
  )
}

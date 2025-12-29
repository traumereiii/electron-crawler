import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { AlertCircle, Clock, Database, TrendingUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import SessionTable from '@renderer/components/history/session-tab/SessionTable'
import SessionDetail from '@renderer/components/history/session-tab/SessionDetail'
import { useState } from 'react'
import { CollectSession } from '@/types'
import {
  useAverageSuccessRate,
  useCollectSessions,
  useSetCollectSessionFilterPeriod,
  useTodayCollectSessions
} from '@renderer/store/history/collect-session'

export default function CollectHistoryPage() {
  const [selectedSession, setSelectedSession] = useState<CollectSession | null>(null)

  const collectSessions = useCollectSessions()
  const todayCollectSessions = useTodayCollectSessions()
  const setCollectSessionFilterPeriod = useSetCollectSessionFilterPeriod()
  const averageSuccessRate = useAverageSuccessRate()
  const handleSessionTableRowClick = async (session: CollectSession) => {
    setSelectedSession(session)
  }
  const handleFilterPeriodChange = (value: 'all' | 'today' | 'week' | 'month') => {
    setCollectSessionFilterPeriod(value)
  }

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 flex items-center gap-2">
              <Database className="size-4" />총 세션 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{collectSessions.length}</div>
            <p className="text-slate-500 mt-1">개</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 flex items-center gap-2">
              <Clock className="size-4" />
              오늘 세션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-purple-600">{todayCollectSessions.length}</div>
            <p className="text-slate-500 mt-1">개</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 flex items-center gap-2">
              <TrendingUp className="size-4" />
              평균 성공률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-600">{averageSuccessRate}%</div>
            <p className="text-slate-500 mt-1">성공</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600 flex items-center gap-2">
              <AlertCircle className="size-4" />
              실패 세션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">0</div>
            <p className="text-slate-500 mt-1">개</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3">
            {/*<div className="flex-1 relative">*/}
            {/*  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />*/}
            {/*  <Input placeholder="엔트리 URL 검색..." className="pl-9 border-gray-200 rounded-xl" />*/}
            {/*</div>*/}
            <Select defaultValue="all" onValueChange={handleFilterPeriodChange}>
              <SelectTrigger className="w-[180px] border-gray-200 rounded-xl">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="week">최근 7일</SelectItem>
                <SelectItem value="month">최근 30일</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] border-gray-200 rounded-xl">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="running">진행 중</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <SessionTable onRowClick={handleSessionTableRowClick} />

      {/* Session Detail Panel */}
      <SessionDetail session={selectedSession} />
    </div>
  )
}

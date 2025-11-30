import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { CollectTask } from '@/types'
import { Badge } from '@renderer/components/ui/badge'
import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { formatDateToKoreanString, formatNumber } from '@renderer/lib/utils'

interface TaskDetailPannelProps {
  collectTask: CollectTask | null
}

export default function TaskDetailPanel({ collectTask }: TaskDetailPannelProps) {
  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>작업 상세 정보</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {(() => {
          if (!collectTask) return null
          return (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl">
                <p className="text-slate-600 text-sm">URL</p>
                <p className="text-slate-900 mt-1 break-all">{collectTask.url}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-slate-600 text-sm">세션</p>
                  <p className="text-slate-900 mt-1">{collectTask.sessionId}</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-slate-600 text-sm">시작 시간</p>
                  <p className="text-slate-900 mt-1">
                    {formatDateToKoreanString(collectTask.startedAt)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-slate-600 text-sm">네비게이션 시간</p>
                  <p className="text-slate-900 mt-1">
                    {formatNumber(collectTask.spentTimeOnNavigateInMillis)} ms
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-slate-600 text-sm">페이지 로드 시간</p>
                  <p className="text-slate-900 mt-1">
                    {formatNumber(collectTask.spentTimeOnPageLoadedInMillis)} ms
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-slate-600 text-sm">상태</p>
                <div className="mt-2 flex items-center gap-2">
                  {collectTask.success ? (
                    <>
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      <span className="text-emerald-600">성공</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5 text-red-600" />
                      <span className="text-red-600">실패</span>
                      {collectTask.errorType && (
                        <Badge className="bg-red-50 text-red-700 border-0 ml-2">
                          {collectTask.errorType}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {/*<Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  <Eye className="size-4 mr-2" />
                  파싱 결과 보기
                </Button>*/}
                {collectTask.screenshot && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    <Eye className="size-4 mr-2" />
                    스크린샷 보기
                  </Button>
                )}
              </div>
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}

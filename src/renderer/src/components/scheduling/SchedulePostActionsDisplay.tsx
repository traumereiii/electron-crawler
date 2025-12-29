import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Bell, FileDown } from 'lucide-react'
import { PostActions } from './types'

interface SchedulePostActionsDisplayProps {
  postActions: PostActions
}

export function SchedulePostActionsDisplay({ postActions }: SchedulePostActionsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>수집 후 동작</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`p-4 rounded-xl border ${postActions.notification ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}
          >
            <Bell
              className={`size-5 mb-2 ${postActions.notification ? 'text-purple-600' : 'text-slate-400'}`}
            />
            <p className="text-sm text-slate-900">알림 전송</p>
            <p className="text-xs text-slate-500 mt-1">
              {postActions.notification ? '활성' : '비활성'}
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border ${postActions.autoExport ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}
          >
            <FileDown
              className={`size-5 mb-2 ${postActions.autoExport ? 'text-emerald-600' : 'text-slate-400'}`}
            />
            <p className="text-sm text-slate-900">자동 내보내기</p>
            <p className="text-xs text-slate-500 mt-1">
              {postActions.autoExport
                ? postActions.exportPath
                  ? '경로 설정됨'
                  : '활성'
                : '비활성'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

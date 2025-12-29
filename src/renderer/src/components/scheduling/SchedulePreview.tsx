import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { ScheduleFormData } from './types'

interface SchedulePreviewProps {
  formData: ScheduleFormData
  isEdit: boolean
  onSave: () => void
  onCancel: () => void
}

export function SchedulePreview({ formData, isEdit, onSave, onCancel }: SchedulePreviewProps) {
  // 실행 주기 텍스트 포맷팅
  let periodText = ''
  if (formData.type === 'daily') {
    periodText = `매일 ${formData.time}`
  } else if (formData.type === 'weekly') {
    const dayCount = formData.weekdays?.length || 0
    periodText = `매주 ${dayCount}일`
  } else if (formData.type === 'monthly') {
    periodText = `매월 ${formData.dayOfMonth}일`
  } else if (formData.type === 'cron') {
    periodText = 'CRON 설정'
  }

  return (
    <Card className="sticky top-5">
      <CardHeader>
        <CardTitle>스케줄 미리보기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-slate-600 text-sm mb-1">스케줄명</p>
          <p className="text-slate-900">{formData.name || '미입력'}</p>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-slate-600 text-sm mb-1">실행 주기</p>
          <p className="text-slate-900">{periodText}</p>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-slate-600 text-sm mb-1">수집 대상</p>
          <p className="text-slate-900">
            {formData.target === 'all' && '전체 사이트'}
            {formData.target === 'specific' && '특정 URL'}
            {formData.target === 'master' && 'Master 기준'}
          </p>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-slate-600 text-sm mb-2">활성화된 옵션</p>
          <div className="space-y-1">
            {formData.postActions?.notification && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="text-slate-700">알림</span>
              </div>
            )}
            {formData.postActions?.autoExport && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="text-slate-700">자동 내보내기</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <Button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
          >
            {isEdit ? '수정 완료' : '스케줄 생성'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            취소
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Bell, FileDown, FolderOpen } from 'lucide-react'
import { IPC_KEYS } from '@/lib/constant'
import { PostActions } from './types'

interface SchedulePostActionsFormProps {
  value: PostActions
  scheduleName: string
  onChange: (postActions: PostActions) => void
}

export function SchedulePostActionsForm({
  value,
  scheduleName,
  onChange
}: SchedulePostActionsFormProps) {
  const updateField = <K extends keyof PostActions>(field: K, fieldValue: PostActions[K]) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleSelectFolder = async () => {
    try {
      const folderPath = (await window.$renderer.request(IPC_KEYS.scheduling.selectFolder)) as
        | string
        | null
      if (folderPath) {
        updateField('exportPath', folderPath)
      }
    } catch (error) {
      console.error('폴더 선택 실패:', error)
    }
  }

  // 파일명 미리보기 생성
  const getFileNamePreview = () => {
    if (!scheduleName) return '스케줄명_2025-01-15_14-30.xlsx'
    const exampleDate = new Date().toISOString().slice(0, 10)
    const exampleTime = '14-30'
    return `${scheduleName}_${exampleDate}_${exampleTime}.xlsx`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>수집 후 동작</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 알림 전송 */}
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={value.notification}
            onChange={(e) => updateField('notification', e.target.checked)}
            className="size-4"
          />
          <Bell className="size-5 text-purple-600" />
          <div className="flex-1">
            <p className="text-slate-900">알림 전송</p>
            <p className="text-slate-500 text-sm">수집 완료 시 데스크탑 알림</p>
          </div>
        </label>

        {/* 자동 내보내기 */}
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={value.autoExport}
            onChange={(e) => updateField('autoExport', e.target.checked)}
            className="size-4"
          />
          <FileDown className="size-5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-slate-900">자동 내보내기</p>
            <p className="text-slate-500 text-sm">수집 완료 시 엑셀 파일로 자동 저장</p>
          </div>
        </label>

        {value.autoExport && (
          <div className="ml-12 space-y-3">
            {/* 폴더 선택 */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                저장 경로 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectFolder}
                  className="border-gray-200 rounded-xl"
                >
                  <FolderOpen className="size-4 mr-1.5" />
                  폴더 선택
                </Button>
                {value.exportPath ? (
                  <div className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 truncate">
                    {value.exportPath}
                  </div>
                ) : (
                  <div className="flex-1 px-3 py-2 bg-red-50 rounded-xl border border-red-200 text-sm text-red-600">
                    폴더를 선택해주세요
                  </div>
                )}
              </div>
            </div>

            {/* 파일명 미리보기 */}
            {value.exportPath && (
              <div>
                <label className="text-slate-600 text-xs mb-1.5 block">파일명 미리보기</label>
                <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-700">
                  {getFileNamePreview()}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

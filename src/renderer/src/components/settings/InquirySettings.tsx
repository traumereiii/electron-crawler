import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { FileArchive, MessageCircleQuestion } from 'lucide-react'
import { toast } from 'sonner'
import { IPC_KEYS } from '@/lib/constant'

export default function InquirySettings() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportLogs = async () => {
    setIsExporting(true)
    try {
      const zipFilePath = await window.$renderer.request<string>(IPC_KEYS.inquiry.exportLogs)
      toast.success(`로그 파일이 압축되었습니다\n${zipFilePath}`, {
        duration: 5000
      })
    } catch (error) {
      const err = error as Error
      toast.error(`로그 압축 실패: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <MessageCircleQuestion className="size-6 text-brand-purple-600" />
          문의하기
        </CardTitle>
        <CardDescription>문제 발생 시 로그를 내보내 문의하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 로그 내보내기 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div className="flex-1">
              <h3 className="text-base font-semibold">로그 파일 내보내기</h3>
              <p className="text-body-sm text-slate-500 mt-1">
                에러 발생 시 로그 파일을 압축하여 문의 시 첨부할 수 있습니다
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-900">압축 파일 내용</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                <li>app.log (전체 로그)</li>
                <li>error.log (에러 로그)</li>
                <li>기타 로그 파일들</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-900">저장 위치</h4>
              <p className="text-sm text-slate-600">프로젝트 루트 폴더에 생성됩니다</p>
            </div>

            <Button
              onClick={handleExportLogs}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 hover:from-brand-purple-600 hover:to-brand-pink-600 text-black"
            >
              <FileArchive className="size-4 mr-2" />
              {isExporting ? '압축 중...' : '로그 파일 압축하기'}
            </Button>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span>💡</span>
            안내사항
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• 압축 완료 시 파일 탐색기가 자동으로 열립니다</li>
            <li>• 압축된 파일을 문의 시 첨부해주세요</li>
            <li>• 로그 파일에는 개인정보가 포함되지 않습니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

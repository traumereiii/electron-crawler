import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Button } from '@renderer/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Database, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { IPC_KEYS } from '@/lib/constant'

export interface DatabaseSettingsValues {
  dbPath: string
}

interface DatabaseSettingsProps {
  values: DatabaseSettingsValues
  onUpdate: <K extends keyof DatabaseSettingsValues>(
    key: K,
    value: DatabaseSettingsValues[K]
  ) => void
}

export default function DatabaseSettings({ values }: DatabaseSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearDatabase = async () => {
    setIsClearing(true)
    try {
      await window.$renderer.request(IPC_KEYS.database.clear)
      toast.success('데이터베이스가 성공적으로 정리되었습니다')
      setIsDialogOpen(false)
    } catch (error) {
      const err = error as Error
      toast.error(`데이터베이스 정리 실패: ${err.message}`)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <>
      <Card className="shadow-lg border-0 animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="size-6 text-brand-purple-600" />
            데이터베이스 설정
          </CardTitle>
          <CardDescription>데이터베이스 관리 및 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-body-md">데이터베이스 경로</Label>
            <div className="p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-700">
              {values.dbPath}
            </div>
            <p className="text-body-sm text-slate-500">현재 사용 중인 데이터베이스 경로</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</h4>
            <p className="text-body-sm text-amber-800">
              데이터베이스를 정리하면 모든 수집 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </p>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setIsDialogOpen(true)}
            disabled={isClearing}
          >
            <Trash2 className="size-4 mr-2" />
            {isClearing ? '정리 중...' : '데이터베이스 정리'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 데이터베이스를 정리하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>이 작업은 다음 데이터를 영구적으로 삭제합니다:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>모든 수집 세션</li>
                <li>모든 작업 내역</li>
                <li>모든 파싱 데이터</li>
                <li>모든 주식 데이터</li>
              </ul>
              <p className="font-semibold text-red-600 mt-3">이 작업은 되돌릴 수 없습니다!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearDatabase}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? '정리 중...' : '확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

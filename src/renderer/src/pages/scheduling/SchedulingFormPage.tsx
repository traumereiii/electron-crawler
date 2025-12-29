import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { IPC_KEYS } from '@/lib/constant'
import { Schedule, ScheduleFormData, ScheduleFormView } from '@renderer/components/scheduling'

export function SchedulingFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scheduleId = searchParams.get('id')
  const isEdit = !!scheduleId

  const [loading, setLoading] = useState(isEdit)
  const [initialData, setInitialData] = useState<Schedule | undefined>(undefined)

  // 수정 모드일 때 스케줄 데이터 조회
  useEffect(() => {
    const loadSchedule = async () => {
      if (!scheduleId) return

      try {
        setLoading(true)
        const dbSchedule = (await window.$renderer.request(
          IPC_KEYS.scheduling.getById,
          scheduleId
        )) as any

        // DB 데이터를 프론트엔드 타입으로 변환
        const weekdays = dbSchedule.weekdays ? JSON.parse(dbSchedule.weekdays) : undefined
        const postActions = JSON.parse(dbSchedule.postActions)

        const schedule: Schedule = {
          id: dbSchedule.id,
          name: dbSchedule.name,
          description: dbSchedule.description || '',
          type: dbSchedule.type.toLowerCase(),
          cronExpression: dbSchedule.cronExpression,
          time: dbSchedule.time,
          weekdays,
          dayOfMonth: dbSchedule.dayOfMonth,
          enabled: dbSchedule.enabled,
          target: 'all',
          targetValue: undefined,
          postActions,
          lastRun: undefined,
          nextRun: dbSchedule.nextRunAt
            ? new Date(dbSchedule.nextRunAt).toLocaleString('ko-KR')
            : undefined,
          createdAt: new Date(dbSchedule.createdAt).toLocaleString('ko-KR')
        }

        setInitialData(schedule)
      } catch (error) {
        console.error('스케줄 조회 실패:', error)
        toast.error('스케줄 정보를 불러오는데 실패했습니다.')
        navigate('/collect-schedule')
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [scheduleId, navigate])

  const handleSave = async (data: ScheduleFormData) => {
    try {
      if (isEdit && scheduleId) {
        // 수정
        const updateDto = {
          name: data.name,
          description: data.description || null,
          type: data.type?.toUpperCase(),
          cronExpression: data.cronExpression,
          time: data.time,
          weekdays: data.weekdays ? JSON.stringify(data.weekdays) : null,
          dayOfMonth: data.dayOfMonth,
          enabled: data.enabled,
          postActions: data.postActions
        }
        await window.$renderer.request(IPC_KEYS.scheduling.update, scheduleId, updateDto)
        toast.success('스케줄이 수정되었습니다.')
      } else {
        // 생성
        const createDto = {
          name: data.name || '',
          description: data.description || null,
          type: data.type?.toUpperCase() || 'DAILY',
          cronExpression: data.cronExpression || null,
          time: data.time || '00:00',
          weekdays: data.weekdays ? JSON.stringify(data.weekdays) : null,
          dayOfMonth: data.dayOfMonth || null,
          enabled: data.enabled ?? true,
          postActions: data.postActions || {
            notification: false,
            autoExport: false
          }
        }
        await window.$renderer.request(IPC_KEYS.scheduling.create, createDto)
        toast.success('스케줄이 생성되었습니다.')
      }

      navigate('/collect-schedule')
    } catch (error) {
      console.error('스케줄 저장 실패:', error)
      toast.error('스케줄 저장에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    navigate('/collect-schedule')
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">스케줄 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <ScheduleFormView
      isEdit={isEdit}
      initialData={initialData}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { IPC_KEYS } from '@/lib/constant'
import { Schedule, ScheduleDetailView, ScheduleLog } from '@renderer/components/scheduling'

export function SchedulingDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [logs, setLogs] = useState<ScheduleLog[]>([])

  // 스케줄 및 실행 이력 조회
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/collect-schedule')
        return
      }

      try {
        setLoading(true)

        // 스케줄 조회
        const dbSchedule = (await window.$renderer.request(IPC_KEYS.scheduling.getById, id)) as any

        // DB 데이터를 프론트엔드 타입으로 변환
        const weekdays = dbSchedule.weekdays ? JSON.parse(dbSchedule.weekdays) : undefined
        const postActions = JSON.parse(dbSchedule.postActions)

        const convertedSchedule: Schedule = {
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

        setSchedule(convertedSchedule)

        // 실행 이력 조회
        const executions = (await window.$renderer.request(
          IPC_KEYS.scheduling.getExecutions,
          id
        )) as any[]

        const convertedLogs: ScheduleLog[] = executions.map((exec: any) => ({
          id: exec.id,
          scheduleId: exec.scheduleId,
          startedAt: new Date(exec.startedAt).toLocaleString('ko-KR'),
          endedAt: exec.endedAt ? new Date(exec.endedAt).toLocaleString('ko-KR') : '',
          success: exec.status === 'COMPLETED',
          totalTasks: exec.totalTasks,
          successTasks: exec.successTasks,
          failedTasks: exec.failedTasks
        }))

        setLogs(convertedLogs)
      } catch (error) {
        console.error('스케줄 조회 실패:', error)
        toast.error('스케줄 정보를 불러오는데 실패했습니다.')
        navigate('/collect-schedule')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, navigate])

  const handleBack = () => {
    navigate('/collect-schedule')
  }

  const handleEdit = (schedule: Schedule) => {
    navigate(`/collect-schedule/form?id=${schedule.id}`)
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

  if (!schedule) return null

  return (
    <ScheduleDetailView schedule={schedule} logs={logs} onBack={handleBack} onEdit={handleEdit} />
  )
}

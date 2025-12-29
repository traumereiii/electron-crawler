import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { IPC_KEYS } from '@/lib/constant'
import { Schedule, ScheduleListView } from '@renderer/components/scheduling'

export function SchedulingListPage() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  // DB에서 스케줄 목록 조회
  const loadSchedules = async () => {
    try {
      setLoading(true)
      const dbSchedules = (await window.$renderer.request(IPC_KEYS.scheduling.getAll)) as any[]

      // DB 데이터를 프론트엔드 타입으로 변환
      const convertedSchedules: Schedule[] = dbSchedules.map((dbSchedule: any) => {
        const weekdays = dbSchedule.weekdays ? JSON.parse(dbSchedule.weekdays) : undefined
        const postActions = JSON.parse(dbSchedule.postActions)

        return {
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
      })

      setSchedules(convertedSchedules)
    } catch (error) {
      console.error('스케줄 조회 실패:', error)
      toast.error('스케줄 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  // 이벤트 핸들러
  const handleCreateClick = () => {
    navigate('/collect-schedule/form')
  }

  const handleViewDetail = (scheduleId: string) => {
    navigate(`/collect-schedule/${scheduleId}`)
  }

  const handleEdit = (schedule: Schedule) => {
    navigate(`/collect-schedule/form?id=${schedule.id}`)
  }

  const handleToggle = async (scheduleId: string) => {
    try {
      await window.$renderer.request(IPC_KEYS.scheduling.toggleEnabled, scheduleId)
      await loadSchedules()
      toast.success('스케줄 상태가 변경되었습니다.')
    } catch (error) {
      console.error('스케줄 토글 실패:', error)
      toast.error('스케줄 상태 변경에 실패했습니다.')
    }
  }

  const handleExecute = async (scheduleId: string) => {
    try {
      const result = (await window.$renderer.request(
        IPC_KEYS.scheduling.executeNow,
        scheduleId
      )) as { sessionId: string }
      toast.success('스케줄이 즉시 실행됩니다.')
      // 데이터 수집 페이지로 이동하며 수집 시작 상태 전달
      navigate('/', { state: { sessionId: result.sessionId, fromSchedule: true } })
    } catch (error) {
      console.error('즉시 실행 실패:', error)
      toast.error('스케줄 실행에 실패했습니다.')
    }
  }

  const handleDelete = async (scheduleId: string) => {
    try {
      await window.$renderer.request(IPC_KEYS.scheduling.delete, scheduleId)
      await loadSchedules()
      toast.success('스케줄이 삭제되었습니다.')
    } catch (error) {
      console.error('스케줄 삭제 실패:', error)
      toast.error('스케줄 삭제에 실패했습니다.')
    }
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">스케줄 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <ScheduleListView
      schedules={schedules}
      onCreateClick={handleCreateClick}
      onViewDetail={handleViewDetail}
      onEdit={handleEdit}
      onToggle={handleToggle}
      onExecute={handleExecute}
      onDelete={handleDelete}
    />
  )
}

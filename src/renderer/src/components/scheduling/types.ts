/**
 * 스케줄 타입 정의
 */
export interface Schedule {
  id: string
  name: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'cron'
  cronExpression?: string
  time: string
  weekdays?: number[]
  dayOfMonth?: number
  enabled: boolean
  target: 'all' | 'specific' | 'master'
  targetValue?: string
  postActions: PostActions
  lastRun?: string
  nextRun?: string
  createdAt: string
}

/**
 * 수집 후 동작 설정
 */
export interface PostActions {
  notification: boolean
  autoExport: boolean
  exportPath?: string | null
}

/**
 * 스케줄 실행 로그
 */
export interface ScheduleLog {
  id: string
  scheduleId: string
  startedAt: string
  endedAt: string
  success: boolean
  totalTasks: number
  successTasks: number
  failedTasks: number
}

/**
 * 스케줄링 뷰 타입
 */
export type SchedulingView = 'list' | 'create' | 'edit' | 'detail'

/**
 * 폼 데이터 타입 (부분적으로 입력 가능)
 */
export type ScheduleFormData = Partial<Schedule>

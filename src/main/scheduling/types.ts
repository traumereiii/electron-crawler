import { CrawlerSchedule, ScheduleExecution } from '@main/generated/prisma/client'
import { CrawlerStartParams, PostActions } from '@/lib/types'

/**
 * 스케줄 생성 요청 DTO
 */
export interface CreateScheduleDto {
  name: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON'
  cronExpression?: string
  time: string
  weekdays?: string // JSON string
  dayOfMonth?: number
  enabled: boolean
  crawlerParams: CrawlerStartParams
  postActions: PostActions
}

/**
 * 스케줄 수정 요청 DTO
 */
export interface UpdateScheduleDto {
  name?: string
  type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON'
  cronExpression?: string
  time?: string
  weekdays?: string
  dayOfMonth?: number
  enabled?: boolean
  crawlerParams?: CrawlerStartParams
  postActions?: PostActions
}

/**
 * 스케줄 실행 옵션
 */
export interface ScheduleExecutionOptions {
  crawlerParams: CrawlerStartParams
}

/**
 * 스케줄 응답 DTO (프론트엔드로 전송)
 */
export interface ScheduleDto extends Omit<CrawlerSchedule, 'postActions'> {
  postActions: PostActions
  crawlerParams?: CrawlerStartParams
}

/**
 * 스케줄 실행 응답 DTO
 */
export interface ScheduleExecutionDto extends ScheduleExecution {
  scheduleName?: string
}

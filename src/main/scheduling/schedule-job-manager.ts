import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import * as cron from 'node-cron'
import { ScheduleService } from './schedule.service'
import { ScheduleExecutorService } from './schedule-executor.service'
import { CrawlerSchedule } from '@main/generated/prisma/client'
import { AutoDeleteService } from '@main/service/auto-delete.service'
import { SettingsService } from '@main/service/settings.service'

@Injectable()
export class ScheduleJobManager implements OnModuleInit {
  private readonly logger = new Logger(ScheduleJobManager.name)
  private readonly jobs = new Map<string, cron.ScheduledTask>()
  private readonly runningSchedules = new Set<string>()

  constructor(
    @Inject(ScheduleService) private readonly scheduleService: ScheduleService,
    @Inject(ScheduleExecutorService) private readonly executorService: ScheduleExecutorService,
    @Inject(AutoDeleteService) private readonly autoDeleteService: AutoDeleteService,
    @Inject(SettingsService) private readonly settings: SettingsService
  ) {}

  /**
   * 모듈 초기화 시 활성 스케줄 로드
   */
  async onModuleInit() {
    this.logger.log('스케줄 Job Manager 초기화 시작')
    const schedules = await this.scheduleService.findAll()
    const activeSchedules = schedules.filter((s) => s.enabled)

    for (const schedule of activeSchedules) {
      await this.registerJob(schedule)
    }

    this.logger.log(`${activeSchedules.length}개의 활성 스케줄을 등록했습니다.`)

    // 자동 삭제 Job 등록
    await this.registerAutoDeleteJob()
  }

  /**
   * CRON Job 등록
   */
  async registerJob(schedule: CrawlerSchedule): Promise<void> {
    try {
      // 기존 Job이 있으면 제거
      this.unregisterJob(schedule.id)

      const cronExpression = this.buildCronExpression(schedule)

      const task = cron.schedule(cronExpression, async () => {
        // 동시 실행 방지
        if (this.runningSchedules.has(schedule.id)) {
          this.logger.warn(`스케줄이 이미 실행 중입니다. 건너뜁니다. [id=${schedule.id}]`)
          return
        }

        this.runningSchedules.add(schedule.id)
        try {
          this.logger.log(`스케줄 자동 실행 시작 [id=${schedule.id}, name=${schedule.name}]`)
          await this.executorService.executeScheduledCrawler(schedule)
        } finally {
          this.runningSchedules.delete(schedule.id)
        }
      })

      task.start()
      this.jobs.set(schedule.id, task)

      this.logger.log(
        `CRON Job 등록 완료 [id=${schedule.id}, name=${schedule.name}, cron=${cronExpression}]`
      )
    } catch (error) {
      const err = error as Error
      this.logger.error(`CRON Job 등록 실패 [id=${schedule.id}, message=${err.message}]`, err.stack)
      throw error
    }
  }

  /**
   * CRON Job 해제
   */
  unregisterJob(scheduleId: string): void {
    const task = this.jobs.get(scheduleId)
    if (task) {
      task.stop()
      this.jobs.delete(scheduleId)
      this.logger.log(`CRON Job 해제 완료 [id=${scheduleId}]`)
    }
  }

  /**
   * CRON 표현식 생성
   */
  private buildCronExpression(schedule: CrawlerSchedule): string {
    switch (schedule.type) {
      case 'DAILY': {
        const [hour, minute] = schedule.time.split(':')
        return `${minute} ${hour} * * *`
      }
      case 'WEEKLY': {
        const [hour, minute] = schedule.time.split(':')
        const weekdays = schedule.weekdays ? JSON.parse(schedule.weekdays) : []
        return `${minute} ${hour} * * ${weekdays.join(',')}`
      }
      case 'MONTHLY': {
        const [hour, minute] = schedule.time.split(':')
        return `${minute} ${hour} ${schedule.dayOfMonth} * *`
      }
      case 'CRON': {
        if (!schedule.cronExpression) {
          throw new Error('CRON 타입인데 cronExpression이 없습니다.')
        }
        return schedule.cronExpression
      }
      default:
        throw new Error(`알 수 없는 스케줄 타입: ${schedule.type}`)
    }
  }

  /**
   * 모든 Job 정보 조회
   */
  getActiveJobs(): string[] {
    return Array.from(this.jobs.keys())
  }

  /**
   * 실행 중인 스케줄 조회
   */
  getRunningSchedules(): string[] {
    return Array.from(this.runningSchedules)
  }

  /**
   * 자동 삭제 Job 등록
   */
  private async registerAutoDeleteJob() {
    const daysStr = await this.settings.getSetting('AUTO_DELETE_DATABASE_IN_DAYS', 0)
    if (!daysStr) {
      this.logger.log('자동 삭제 설정이 없습니다')
      return
    }

    const days = parseInt(daysStr)
    if (isNaN(days) || days <= 0) {
      this.logger.log('자동 삭제가 비활성화되어 있습니다')
      return
    }

    // 기존 Job 해제 (있다면)
    const autoDeleteJobKey = 'auto-delete'
    if (this.jobs.has(autoDeleteJobKey)) {
      this.jobs.get(autoDeleteJobKey)?.stop()
      this.jobs.delete(autoDeleteJobKey)
    }

    // 매일 00:00에 실행
    const cronExpression = '0 0 * * *'
    const job = cron.schedule(cronExpression, async () => {
      this.logger.log('자동 삭제 스케줄 실행')
      await this.autoDeleteService.deleteOldData(days)
    })

    job.start()
    this.jobs.set(autoDeleteJobKey, job)
    this.logger.log(`자동 삭제 Job 등록 완료: ${days}일 이전 데이터, 매일 00:00 실행`)
  }

  /**
   * 설정 변경 시 자동 삭제 Job 재등록
   */
  async reloadAutoDeleteJob() {
    await this.registerAutoDeleteJob()
  }
}

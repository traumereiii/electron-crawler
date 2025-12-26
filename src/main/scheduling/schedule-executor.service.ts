import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { NaverStockCrawler } from '@main/crawler/naver-stock.crawler'
import { CollectSessionStatus, CrawlerSchedule } from '@main/generated/prisma/client'
import { ScheduleService } from './schedule.service'
import { PostActionHandler } from './post-action-handler'
import { CrawlerStartParams, PostActions } from '@/lib/types'

@Injectable()
export class ScheduleExecutorService {
  private readonly logger = new Logger(ScheduleExecutorService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly crawler: NaverStockCrawler,
    private readonly scheduleService: ScheduleService,
    private readonly postActionHandler: PostActionHandler
  ) {}

  /**
   * 스케줄된 크롤러 실행 (자동 실행)
   */
  async executeScheduledCrawler(schedule: CrawlerSchedule): Promise<void> {
    this.logger.log(`스케줄 실행 시작 [id=${schedule.id}, name=${schedule.name}]`)

    // ScheduleExecution 생성
    const execution = await this.prisma.scheduleExecution.create({
      data: {
        scheduleId: schedule.id,
        status: 'RUNNING',
        startedAt: new Date()
      }
    })

    try {
      // Post actions 파싱
      const postActions: PostActions = JSON.parse(schedule.postActions)
      const crawlerParams: CrawlerStartParams = JSON.parse(schedule.postActions) // TODO: 별도 필드로 저장 필요

      // 크롤러 시작
      const sessionId = await this.crawler.start({
        headless: crawlerParams.headless,
        width: crawlerParams.width,
        height: crawlerParams.height,
        maxConcurrentTabs: crawlerParams.maxConcurrentTabs,
        params: {
          pageNumbers: crawlerParams.pageNumbers
        }
      })

      // ScheduleExecution에 sessionId 기록
      await this.prisma.scheduleExecution.update({
        where: { id: execution.id },
        data: { sessionId }
      })

      // 크롤링 완료 대기
      await this.waitForCrawlerCompletion(sessionId)

      // 결과 수집
      const session = await this.prisma.collectSession.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        throw new Error(`세션을 찾을 수 없습니다. (ID: ${sessionId})`)
      }

      // ScheduleExecution 완료 처리
      const status = session.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED'
      const updatedExecution = await this.prisma.scheduleExecution.update({
        where: { id: execution.id },
        data: {
          status,
          totalTasks: session.totalTasks,
          successTasks: session.successTasks,
          failedTasks: session.failedTasks,
          endedAt: new Date()
        }
      })

      // 수집 후 동작 처리
      await this.postActionHandler.handle(updatedExecution, postActions)

      // nextRunAt 갱신
      await this.scheduleService.updateNextRun(schedule.id)

      this.logger.log(
        `스케줄 실행 완료 [id=${schedule.id}, status=${status}, total=${session.totalTasks}, success=${session.successTasks}, failed=${session.failedTasks}]`
      )
    } catch (error) {
      const err = error as Error
      this.logger.error(`스케줄 실행 실패 [id=${schedule.id}, message=${err.message}]`, err.stack)

      await this.prisma.scheduleExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: err.message,
          endedAt: new Date()
        }
      })

      // 실패해도 nextRunAt은 갱신
      await this.scheduleService.updateNextRun(schedule.id)
    }
  }

  /**
   * 수동 실행 (즉시 실행)
   */
  async executeNow(scheduleId: string): Promise<string> {
    const schedule = await this.scheduleService.findById(scheduleId)
    await this.executeScheduledCrawler(schedule)
    return `스케줄 실행이 시작되었습니다. (ID: ${scheduleId})`
  }

  /**
   * 크롤링 완료 대기 (폴링 방식)
   */
  private async waitForCrawlerCompletion(sessionId: string): Promise<void> {
    const maxWaitTime = 30 * 60 * 1000 // 30분
    const pollInterval = 2000 // 2초
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const session = await this.prisma.collectSession.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        throw new Error(`세션을 찾을 수 없습니다. (ID: ${sessionId})`)
      }

      const finishedStatuses: CollectSessionStatus[] = ['COMPLETED', 'TERMINATED', 'FAILED']
      if (finishedStatuses.includes(session.status)) {
        this.logger.log(`크롤링 완료 [sessionId=${sessionId}, status=${session.status}]`)
        return
      }

      // 2초 대기
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    throw new Error(`크롤링 타임아웃 (30분 초과) [sessionId=${sessionId}]`)
  }
}

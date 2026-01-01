import { Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { NaverStockCrawler } from '@main/crawler/naver-stock.crawler'
import { CollectSessionStatus, CrawlerSchedule, SettingKey } from '@main/generated/prisma/client'
import { ScheduleService } from './schedule.service'
import { PostActionHandler } from './post-action-handler'
import { CrawlerStartParams, PostActions } from '@/lib/types'
import { getLocalDate } from '@main/lib/utils'

@Injectable()
export class ScheduleExecutorService {
  private readonly logger = new Logger(ScheduleExecutorService.name)

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NaverStockCrawler) private readonly crawler: NaverStockCrawler,
    @Inject(ScheduleService) private readonly scheduleService: ScheduleService,
    @Inject(PostActionHandler) private readonly postActionHandler: PostActionHandler
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
        startedAt: getLocalDate()
      }
    })

    try {
      // Post actions 파싱
      await this.prisma.setting.findUnique({ where: { key: 'SCHEDULED_CRAWLER_TAB_1' } })

      const postActions: PostActions = JSON.parse(schedule.postActions)
      const crawlerParams: CrawlerStartParams = JSON.parse(schedule.postActions)

      // 크롤러 시작
      const sessionId = await this.crawler.start({
        headless: crawlerParams.headless,
        width: crawlerParams.width,
        height: crawlerParams.height,
        maxConcurrentTabs: crawlerParams.maxConcurrentTabs,
        executionType: 'SCHEDULED_AUTO',
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
          endedAt: getLocalDate()
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
          endedAt: getLocalDate()
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
    return await this.startScheduledCrawler(schedule)
  }

  /**
   * 스케줄 크롤러 시작 (즉시 반환)
   */
  private async startScheduledCrawler(schedule: CrawlerSchedule): Promise<string> {
    this.logger.log(`스케줄 실행 시작 [id=${schedule.id}, name=${schedule.name}]`)

    // ScheduleExecution 생성
    const execution = await this.prisma.scheduleExecution.create({
      data: {
        scheduleId: schedule.id,
        status: 'RUNNING',
        startedAt: getLocalDate()
      }
    })

    try {
      const postActions: PostActions = JSON.parse(schedule.postActions)
      const crawlerParams: CrawlerStartParams = JSON.parse(schedule.postActions)

      await this.fetchScheduledCrawlerOptions('SCHEDULED_CRAWLER_TAB_1', 1)

      // 크롤러 시작
      const sessionId = await this.crawler.start({
        width: crawlerParams.width,
        height: crawlerParams.height,
        maxConcurrentTabs: [
          await this.fetchScheduledCrawlerOptions('SCHEDULED_CRAWLER_TAB_1', 1),
          await this.fetchScheduledCrawlerOptions('SCHEDULED_CRAWLER_TAB_2', 4),
          await this.fetchScheduledCrawlerOptions('SCHEDULED_CRAWLER_TAB_3', 5)
        ],
        headless:
          (await this.fetchScheduledCrawlerOptions('SCHEDULED_CRAWLER_HEADLESS', 'Y')) === 'Y',
        screenshot:
          (await this.fetchScheduledCrawlerOptions('SCHEDULED_CRAWLER_SCREENSHOT', 'N')) === 'N',
        executionType: 'SCHEDULED_IMMEDIATE',
        params: {
          pageNumbers: crawlerParams.pageNumbers
        }
      })

      // ScheduleExecution에 sessionId 기록
      await this.prisma.scheduleExecution.update({
        where: { id: execution.id },
        data: { sessionId }
      })

      // 백그라운드에서 완료 처리
      this.monitorAndFinalizeCrawler(execution.id, sessionId, schedule.id, postActions).catch(
        (error) => {
          this.logger.error(`크롤러 모니터링 실패: ${error.message}`, error.stack)
        }
      )

      return sessionId
    } catch (error) {
      const err = error as Error
      this.logger.error(`스케줄 실행 실패 [id=${schedule.id}, message=${err.message}]`, err.stack)

      await this.prisma.scheduleExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: err.message,
          endedAt: getLocalDate()
        }
      })

      throw error
    }
  }

  /**
   * 크롤러 모니터링 및 완료 처리 (백그라운드)
   */
  private async monitorAndFinalizeCrawler(
    executionId: string,
    sessionId: string,
    scheduleId: string,
    postActions: PostActions
  ): Promise<void> {
    try {
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
        where: { id: executionId },
        data: {
          status,
          totalTasks: session.totalTasks,
          successTasks: session.successTasks,
          failedTasks: session.failedTasks,
          endedAt: getLocalDate()
        }
      })

      // 수집 후 동작 처리
      await this.postActionHandler.handle(updatedExecution, postActions)

      // nextRunAt 갱신
      await this.scheduleService.updateNextRun(scheduleId)

      this.logger.log(
        `스케줄 실행 완료 [scheduleId=${scheduleId}, status=${status}, total=${session.totalTasks}, success=${session.successTasks}, failed=${session.failedTasks}]`
      )
    } catch (error) {
      const err = error as Error
      this.logger.error(
        `스케줄 완료 처리 실패 [executionId=${executionId}, message=${err.message}]`,
        err.stack
      )

      await this.prisma.scheduleExecution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          error: err.message,
          endedAt: getLocalDate()
        }
      })

      // 실패해도 nextRunAt은 갱신
      await this.scheduleService.updateNextRun(scheduleId)
    }
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

      const finishedStatuses: CollectSessionStatus[] = ['COMPLETED', 'TERMINATED']
      if (finishedStatuses.includes(session.status)) {
        this.logger.log(`크롤링 완료 [sessionId=${sessionId}, status=${session.status}]`)
        return
      }

      // 2초 대기
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    throw new Error(`크롤링 타임아웃 (30분 초과) [sessionId=${sessionId}]`)
  }

  private async fetchScheduledCrawlerOptions(key: SettingKey, orElse: any) {
    const setting = await this.prisma.setting.findUnique({ where: { key } })
    if (setting) {
      return setting.value
    }
    return orElse
  }
}

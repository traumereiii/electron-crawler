import { Injectable, Logger } from '@nestjs/common'
import { Notification } from 'electron'
import { PostActions } from '@/lib/types'
import { ScheduleExecution } from '@main/generated/prisma/client'
import { ExcelService } from '@main/service/excel.service'
import { PrismaService } from '@main/prisma.service'

@Injectable()
export class PostActionHandler {
  private readonly logger = new Logger(PostActionHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly excelService: ExcelService
  ) {}

  /**
   * 수집 후 동작 총괄 처리
   */
  async handle(execution: ScheduleExecution, postActions: PostActions): Promise<void> {
    this.logger.log(`수집 후 동작 처리 시작 [executionId=${execution.id}]`)

    try {
      // 1. 데스크탑 알림
      if (postActions.notification) {
        await this.sendNotification(execution)
      }

      // 2. 자동 엑셀 내보내기
      if (postActions.autoExport && execution.sessionId) {
        await this.autoExport(execution.sessionId, postActions.exportPath)
      }

      // 3. 스크린샷 정리
      if (postActions.screenshotCleanup && execution.sessionId) {
        await this.cleanupScreenshots(execution.sessionId)
      }

      // 4. Webhook 호출
      if (postActions.webhookUrl) {
        await this.callWebhook(execution, postActions.webhookUrl)
      }

      this.logger.log(`수집 후 동작 처리 완료 [executionId=${execution.id}]`)
    } catch (error) {
      const err = error as Error
      this.logger.error(
        `수집 후 동작 처리 실패 [executionId=${execution.id}, message=${err.message}]`,
        err.stack
      )
    }
  }

  /**
   * 데스크탑 알림 전송
   */
  private async sendNotification(execution: ScheduleExecution): Promise<void> {
    try {
      const notification = new Notification({
        title: '크롤링 수집 완료',
        body: `성공: ${execution.successTasks}, 실패: ${execution.failedTasks}`,
        silent: false
      })

      notification.show()
      this.logger.log(`데스크탑 알림 전송 완료 [executionId=${execution.id}]`)
    } catch (error) {
      const err = error as Error
      this.logger.error(`데스크탑 알림 전송 실패: ${err.message}`, err.stack)
    }
  }

  /**
   * 자동 엑셀 내보내기
   */
  private async autoExport(sessionId: string, exportPath: string | null): Promise<void> {
    try {
      // 세션의 stock 데이터 조회
      const stocks = await this.prisma.stock.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' }
      })

      if (stocks.length === 0) {
        this.logger.warn(`내보낼 데이터가 없습니다. [sessionId=${sessionId}]`)
        return
      }

      // 엑셀 파일 생성
      const filePath = await this.excelService.create(stocks)

      this.logger.log(
        `자동 엑셀 내보내기 완료 [sessionId=${sessionId}, count=${stocks.length}, path=${filePath}]`
      )
    } catch (error) {
      const err = error as Error
      this.logger.error(`자동 엑셀 내보내기 실패: ${err.message}`, err.stack)
    }
  }

  /**
   * 스크린샷 정리
   */
  private async cleanupScreenshots(sessionId: string): Promise<void> {
    try {
      // 세션의 모든 CollectTask 조회
      const tasks = await this.prisma.collectTask.findMany({
        where: {
          sessionId,
          screenshot: {
            not: null
          }
        },
        select: {
          id: true,
          screenshot: true
        }
      })

      if (tasks.length === 0) {
        this.logger.log(`정리할 스크린샷이 없습니다. [sessionId=${sessionId}]`)
        return
      }

      // DB에서 스크린샷 경로 제거
      await this.prisma.collectTask.updateMany({
        where: { sessionId },
        data: { screenshot: null }
      })

      // TODO: 실제 파일 시스템에서 스크린샷 파일 삭제
      // 현재는 DB 경로만 제거

      this.logger.log(`스크린샷 정리 완료 [sessionId=${sessionId}, count=${tasks.length}]`)
    } catch (error) {
      const err = error as Error
      this.logger.error(`스크린샷 정리 실패: ${err.message}`, err.stack)
    }
  }

  /**
   * Webhook 호출
   */
  private async callWebhook(execution: ScheduleExecution, webhookUrl: string): Promise<void> {
    try {
      const payload = {
        executionId: execution.id,
        scheduleId: execution.scheduleId,
        sessionId: execution.sessionId,
        status: execution.status,
        totalTasks: execution.totalTasks,
        successTasks: execution.successTasks,
        failedTasks: execution.failedTasks,
        startedAt: execution.startedAt.toISOString(),
        endedAt: execution.endedAt?.toISOString(),
        error: execution.error
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Webhook 호출 실패: ${response.status} ${response.statusText}`)
      }

      this.logger.log(`Webhook 호출 완료 [executionId=${execution.id}, url=${webhookUrl}]`)
    } catch (error) {
      const err = error as Error
      this.logger.error(`Webhook 호출 실패: ${err.message}`, err.stack)
    }
  }
}

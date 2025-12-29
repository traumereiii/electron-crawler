import { Inject, Injectable, Logger } from '@nestjs/common'
import { Notification } from 'electron'
import { PostActions } from '@/lib/types'
import { ScheduleExecution } from '@main/generated/prisma/client'
import { ExcelService } from '@main/service/excel.service'
import { PrismaService } from '@main/prisma.service'

@Injectable()
export class PostActionHandler {
  private readonly logger = new Logger(PostActionHandler.name)

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ExcelService) private readonly excelService: ExcelService
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
}

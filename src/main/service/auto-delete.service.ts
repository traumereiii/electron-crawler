import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { SettingsService } from '@main/service/settings.service'
import { getLocalDate } from '@main/lib/utils'

@Injectable()
export class AutoDeleteService implements OnModuleInit {
  private readonly logger = new Logger(AutoDeleteService.name)
  private isDeleting = false // 중복 실행 방지

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SettingsService) private readonly settings: SettingsService
  ) {}

  // 앱 시작 시 실행
  async onModuleInit() {
    await this.loadSettingsAndDelete()
  }

  // 설정 불러오고 삭제 실행
  async loadSettingsAndDelete() {
    const daysStr = await this.settings.getSetting('AUTO_DELETE_DATABASE_IN_DAYS', 0)
    if (!daysStr) return

    const days = parseInt(daysStr)
    if (isNaN(days) || days <= 0) return

    await this.deleteOldData(days)
  }

  // N일 지난 데이터 삭제
  async deleteOldData(days: number) {
    if (this.isDeleting) {
      this.logger.warn('자동 삭제가 이미 실행 중입니다')
      return
    }

    this.isDeleting = true
    const cutoffDate = getLocalDate()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    try {
      this.logger.log(`${days}일 이전 데이터 삭제 시작 (기준: ${cutoffDate.toISOString()})`)

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. 삭제 대상 세션 ID 조회
        const oldSessions = await tx.collectSession.findMany({
          where: { startedAt: { lt: cutoffDate } },
          select: { id: true }
        })
        const sessionIds = oldSessions.map((s) => s.id)

        if (sessionIds.length === 0) {
          return { sessions: 0, tasks: 0, parsings: 0, stocks: 0, schedules: 0, executions: 0 }
        }

        // 2. 연관 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
        const deletedStocks = await tx.stock.deleteMany({
          where: { sessionId: { in: sessionIds } }
        })

        const deletedParsings = await tx.parsing.deleteMany({
          where: { collectTask: { sessionId: { in: sessionIds } } }
        })

        const deletedTasks = await tx.collectTask.deleteMany({
          where: { sessionId: { in: sessionIds } }
        })

        const deletedSessions = await tx.collectSession.deleteMany({
          where: { id: { in: sessionIds } }
        })

        // 3. 스케줄 관련 데이터 삭제
        const deletedExecutions = await tx.scheduleExecution.deleteMany({
          where: { startedAt: { lt: cutoffDate } }
        })

        const deletedSchedules = await tx.crawlerSchedule.deleteMany({
          where: { createdAt: { lt: cutoffDate } }
        })

        return {
          sessions: deletedSessions.count,
          tasks: deletedTasks.count,
          parsings: deletedParsings.count,
          stocks: deletedStocks.count,
          schedules: deletedSchedules.count,
          executions: deletedExecutions.count
        }
      })

      this.logger.log(
        `자동 삭제 완료: ` +
          `세션 ${result.sessions}개, ` +
          `작업 ${result.tasks}개, ` +
          `파싱 ${result.parsings}개, ` +
          `주식 ${result.stocks}개, ` +
          `스케줄 ${result.schedules}개, ` +
          `실행기록 ${result.executions}개`
      )

      return result
    } catch (error) {
      this.logger.error('자동 삭제 실패', error)
      throw error
    } finally {
      this.isDeleting = false
    }
  }
}

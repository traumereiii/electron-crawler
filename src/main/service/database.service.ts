import { Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'

const logger = new Logger('DatabaseService')

@Injectable()
export class DatabaseService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  /**
   * 데이터베이스의 모든 수집 데이터를 삭제합니다.
   * 외래 키 제약 조건을 고려하여 순서대로 삭제합니다.
   */
  public async clearDatabase(): Promise<void> {
    try {
      logger.log('[데이터베이스] 정리 시작')

      // 트랜잭션으로 안전하게 삭제
      await this.prismaService.$transaction(async (tx) => {
        // 1. Stock 삭제 (외래 키 없음)
        const stockCount = await tx.stock.deleteMany()
        logger.log(`[데이터베이스] Stock 삭제 완료: ${stockCount.count}개`)

        // 2. Parsing 삭제 (collectTaskId 외래 키)
        const parsingCount = await tx.parsing.deleteMany()
        logger.log(`[데이터베이스] Parsing 삭제 완료: ${parsingCount.count}개`)

        // 3. CollectTask 삭제 (sessionId 외래 키)
        const taskCount = await tx.collectTask.deleteMany()
        logger.log(`[데이터베이스] CollectTask 삭제 완료: ${taskCount.count}개`)

        // 4. CollectSession 삭제
        const sessionCount = await tx.collectSession.deleteMany()
        logger.log(`[데이터베이스] CollectSession 삭제 완료: ${sessionCount.count}개`)

        // 5. CrawlerSchedule 삭제
        const scheduleCount = await tx.crawlerSchedule.deleteMany()
        logger.log(`[데이터베이스] CrawlerSchedule 삭제 완료: ${scheduleCount.count}개`)

        // 6. ScheduleExecution 삭제
        const executionCount = await tx.scheduleExecution.deleteMany()
        logger.log(`[데이터베이스] ScheduleExecution 삭제 완료: ${executionCount.count}개`)
      })

      logger.log('[데이터베이스] 정리 완료')
    } catch (error) {
      const err = error as Error
      logger.error(`[데이터베이스] 정리 실패: ${err.message}`, err.stack)
      throw new Error(`데이터베이스 정리 중 오류가 발생했습니다: ${err.message}`)
    }
  }
}

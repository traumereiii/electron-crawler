import { PrismaService } from '@main/prisma.service'
import { ParsingRequest } from '@main/parser/types'
import { Logger } from '@nestjs/common'

const logger = new Logger('Parser')

export abstract class Parser {
  constructor(protected prismaService: PrismaService) {}

  abstract parse(request: ParsingRequest): Promise<void>

  protected async successHistory(request: ParsingRequest) {
    try {
      const id = crypto.randomUUID()
      await this.prismaService.parsing.create({
        data: {
          id: id,
          collectTask: request.collectTask,
          url: request.url,
          html: '',
          success: true,
          createdAt: new Date()
        }
      })
      logger.log(`[파서] 파싱 이력 생성 [성공] [${request.url}]`)
    } catch (e) {
      // TODO 에러처리
      console.error(e)
      throw e
    }
  }

  protected async failHistory(request: ParsingRequest, error: Error, type: string) {
    try {
      const id = crypto.randomUUID()
      await this.prismaService.parsing.create({
        data: {
          id: id,
          collectTask: request.collectTask,
          url: request.url,
          html: '',
          success: false,
          createdAt: new Date(),
          error: error.message,
          errorType: type
        }
      })
      logger.log(`[파서] 파싱 이력 생성 [실패] [${request.url}] [${error.message}]`)
    } catch (e) {
      // TODO 에러처리
      console.error(e)
      throw e
    }
  }
}

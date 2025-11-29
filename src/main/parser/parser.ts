import { PrismaService } from '@main/prisma.service'
import { ParsingRequest } from '@main/parser/types'
import { Logger } from '@nestjs/common'
import { sendLog } from '@main/controller/crawler.controller'
import { load as cheerioLoad } from 'cheerio'
import type { CheerioAPI } from 'cheerio'

const logger = new Logger('Parser')

export abstract class Parser {
  constructor(protected prismaService: PrismaService) {}

  public async start(request: ParsingRequest) {
    try {
      // do something
      const $ = cheerioLoad(request.html)
      await this.parse($, request)

      this.successHistory(request)
    } catch (e) {
      this.failHistory(request, e as Error, 'UNKNOWN_ERROR')
    }
  }

  protected abstract parse($: CheerioAPI, request: ParsingRequest): Promise<void>

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
      sendLog({ type: 'success', message: `[파서] 파싱 성공 [url=${request.url}]` })
    } catch (e) {
      const error = e as Error
      logger.error(
        `[파서] 파싱 이력 생성 실패 [url=${request.url} message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `[파서] 파싱 이력 생성 실패 [url=${request.url} message=${error.message}]`
      })
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
      sendLog({ type: 'success', message: `[파서] 파싱 실패 [url=${request.url}]` })
    } catch (e) {
      const error = e as Error
      logger.error(
        `[파서] 파싱 이력 생성 실패 [url=${request.url} message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `[파서] 파싱 이력 생성 실패 [url=${request.url} message=${error.message}]`
      })
    }
  }
}

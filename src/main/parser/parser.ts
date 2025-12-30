import { PrismaService } from '@main/prisma.service'
import { ParsingErrorType, ParsingRequest, ParsingResultInner } from '@main/parser/types'
import { Logger } from '@nestjs/common'
import { sendLog } from '@main/controller/crawler.controller'
import type { CheerioAPI } from 'cheerio'
import { load as cheerioLoad } from 'cheerio'

const logger = new Logger('Parser')

export abstract class Parser<T> {
  constructor(protected prismaService: PrismaService) {}

  public async start(request: ParsingRequest<T>) {
    try {
      let parsingResultInner: ParsingResultInner<T> | null = null

      /** 1. 파싱 **/
      try {
        const $ = cheerioLoad(request.html)
        parsingResultInner = this.parse($, request)
      } catch (e) {
        const error = e as Error
        logger.error(
          `[파서] 파싱 실패 [${request.url}} [session=${request.sessionId}] [${error.message}] ${error.stack}]`
        )
        this.failHistory(request, e as Error, ParsingErrorType.PARSING_FAIL)
        return
      }

      if (parsingResultInner?.success) {
        /** 2. 성공 핸들러(저장) **/
        request
          .onSuccess(request, parsingResultInner)
          .then(() => this.successHistory(request))
          .catch((e) => {
            const error = e as Error
            logger.error(
              `[파서] 파싱 후 성공 핸들러 실패 [${request.url}} [session=${request.sessionId}] [${error.message}] ${error.stack}]`
            )
            this.failHistory(request, e as Error, ParsingErrorType.SUCCESS_HANDLER_FAIL)
          })
      } else {
        request.onFail(new Error('파싱 실패'), request, parsingResultInner)
      }
    } catch (e) {
      const error = e as Error
      logger.error(
        `[파서] 알 수 없는 에러 [${request.url}} [session=${request.sessionId}] [${error.message}] ${error.stack}]`
      )
      this.failHistory(request, e as Error, ParsingErrorType.UNKNOWN_ERROR)
    }
  }

  protected abstract parse($: CheerioAPI, request: ParsingRequest<T>): ParsingResultInner<T>

  protected async successHistory(request: ParsingRequest<T>) {
    try {
      await this.prismaService.parsing.create({
        data: {
          id: crypto.randomUUID(),
          collectTaskId: request.taskId,
          url: request.url,
          html: request.html,
          success: true,
          createdAt: new Date()
        }
      })
      logger.log(`[파서] 파싱 이력 생성 [성공] [${request.url}]`)
      sendLog({ type: 'success', message: `[파서] 파싱 성공 [${request.url}]` })
    } catch (e) {
      const error = e as Error
      logger.error(`[파서] 파싱 이력 생성 실패 [${request.url}] [${error.message}] ${error.stack}]`)
      sendLog({
        type: 'error',
        message: `[파서] 파싱 이력 생성 실패 [${request.url}] [${error.message}]`
      })
    }
  }

  protected async failHistory(request: ParsingRequest<T>, error: Error, type: string) {
    try {
      await this.prismaService.parsing.create({
        data: {
          id: crypto.randomUUID(),
          collectTaskId: request.taskId,
          url: request.url,
          html: request.html,
          success: false,
          createdAt: new Date(),
          error: error.message,
          errorType: type
        }
      })
      sendLog({
        type: 'error',
        message: `[파서] 파싱 실패 [${request.url}] [${error.message}]`
      })
    } catch (e) {
      const error = e as Error
      logger.error(`[파서] 파싱 이력 생성 실패 [${request.url}] [${error.message}] ${error.stack}]`)
      sendLog({
        type: 'error',
        message: `[파서] 파싱 이력 생성 실패 [${request.url}] [${error.message}]`
      })
    }
  }
}

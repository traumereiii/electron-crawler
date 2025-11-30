import puppeteer from 'puppeteer-extra'
import { CrawlerExecuteOptions, TabTaskResult } from '@main/crawler/core/types'
import { extendPage } from '@main/crawler/core/extension'
import { Browser } from 'puppeteer'
import { Record } from '@prisma/client/runtime/client'
import { PrismaService } from '@main/prisma.service'
import { Logger } from '@nestjs/common'
import { sendLog } from '@main/controller/crawler.controller'

const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

export async function initBrowser(options?: CrawlerExecuteOptions) {
  const browser = await puppeteer.launch({
    headless: options?.headless ?? false,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${options?.width || 1280},${options?.height || 720}`
    ]
    // size of browser
  })

  const page = await browser.newPage()
  await extendPage(page)

  await page.close()

  return browser
}

const logger = new Logger('Crawler')

export abstract class Crawler {
  protected browser: Browser | undefined

  constructor(protected prismaService: PrismaService) {}

  async start(options?: CrawlerExecuteOptions): Promise<void> {
    if (this.browser) {
      await this.browser.close()
    }
    this.browser = await initBrowser(options)
    await this.run(options?.params)
  }

  async stop(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = undefined
    }
  }

  abstract run(params?: Record<string, any>): Promise<void>

  protected async createSessionHistory(entryUrl: string): Promise<string> {
    try {
      const id = crypto.randomUUID()
      await this.prismaService.collectSession.create({
        data: {
          id: id,
          entryUrl: entryUrl,
          totalTasks: 0,
          successTasks: 0,
          failedTasks: 0,
          startedAt: new Date(),
          status: 'IN_PROGRESS'
        }
      })
      logger.log(`[크롤러] 수집 이력 생성 [${id}]`)
      return id
    } catch (e) {
      const error = e as Error
      logger.error(
        `[크롤러] 수집 이력 생설 실패 [url=${entryUrl}, message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `[파서] 파싱 이력 생성 실패 [url=${entryUrl}, message=${error.message}]`
      })
      throw error
    }
  }

  protected async saveHistory(sessionId: string, task: TabTaskResult) {
    try {
      console.log('saveHistory check 1 : ', sessionId, task)
      await this.prismaService.$transaction(async (prisma) => {
        await prisma.collectSession.update({
          where: { id: sessionId },
          data: {
            totalTasks: { increment: 1 },
            successTasks: task.success ? { increment: 1 } : undefined,
            failedTasks: !task.success ? { increment: 1 } : undefined
          }
        })
        console.log('saveHistory check 2 : ', sessionId)
        await prisma.collectTask.create({
          data: {
            id: task.id,
            sessionId: sessionId,
            parentId: task.parentId,
            url: task.url,
            success: task.success,
            screenshot: task.screenshot,
            startedAt: task.startedAt,
            spentTimeOnNavigateInMillis: task.spentTimeOnNavigateInMillis,
            spentTimeOnPageLoadedInMillis: task.spentTimeOnPageLoadedInMillis,
            error: task.error?.message,
            errorType: task.errorType
          }
        })
        console.log('saveHistory check 3 : ', sessionId)
        await logger.log(`[크롤러] 수집 작업 이력 생성 [id=${task.id}, url=${task.url}]`)
      })
    } catch (e) {
      const error = e as Error
      logger.error(
        `[크롤러] 수집 이력 생설 실패 [url=${task.url}, message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `[파서] 파싱 이력 생성 실패 [url=${task.url}, message=${error.message}]`
      })
    }
  }

  defaultSuccessHandler = (sessionId: string) => async (task, result) => {
    console.log('defaultSuccessHandler check: ', sessionId, task, result)
    logger.log(
      `[크롤러] 수집 작업 완료: ${task.url}, 페이지 이동 소요시간: ${result.spentTimeOnNavigateInMillis}ms, 작업 소요시간: ${result.spentTimeOnPageLoadedInMillis}ms`
    )
    this.saveHistory(sessionId, result)
  }

  defaultErrorHandler = (sessionId: string) => async (error: Error, _, result) => {
    logger.error(
      `[크롤러] 수집 작업 중 에러 발생 [url=${result.url}, message=${error.message}, stack=${error.stack}]`
    )
    // 렌더러로 메세지 전송
    this.saveHistory(sessionId, result)
  }
}

import puppeteer from 'puppeteer-extra'
import { CrawlerExecuteOptions, TabTaskResult } from '@main/crawler/core/types'
import { extendPage } from '@main/crawler/core/extension'
import { Browser } from 'puppeteer'
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

  async start(options?: CrawlerExecuteOptions): Promise<string> {
    await this.stop()
    this.browser = await initBrowser(options)
    return await this.run(options)
  }

  async stop(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = undefined
    }
  }

  abstract run(options?: CrawlerExecuteOptions): Promise<string>

  protected async createSessionHistory(entryUrl: string): Promise<string> {
    const id = crypto.randomUUID()
    try {
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
      // logger.log(`[크롤러] 수집 이력 생성 [${id}]`)
      return id
    } catch (e) {
      const error = e as Error
      logger.error(
        `[크롤러] 수집 이력 생설 실패 [url=${entryUrl}, message=${error.message}, stack=${error.stack}]`
      )
      throw error
    }
  }

  protected async finalizeSession(sessionId: string): Promise<void> {
    try {
      const session = await this.prismaService.collectSession.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        logger.warn(`[크롤러] 세션을 찾을 수 없음 [${sessionId}]`)
        return
      }

      const status: 'COMPLETED' | 'FAILED' = session.failedTasks > 0 ? 'FAILED' : 'COMPLETED'

      await this.prismaService.collectSession.update({
        where: { id: sessionId },
        data: {
          finishedAt: new Date(),
          status: status
        }
      })

      logger.log(
        `[크롤러] 수집 세션 종료 [id=${sessionId}, status=${status}, total=${session.totalTasks}, success=${session.successTasks}, failed=${session.failedTasks}]`
      )
      sendLog({
        type: status === 'COMPLETED' ? 'success' : 'error',
        message: `수집 완료 [${status}] - 전체: ${session.totalTasks}, 성공: ${session.successTasks}, 실패: ${session.failedTasks}`
      })
    } catch (e) {
      const error = e as Error
      logger.error(
        `[크롤러] 세션 종료 실패 [sessionId=${sessionId}, message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `세션 종료 실패 [${sessionId}]`
      })
    }
  }

  private async saveHistory(sessionId: string, task: TabTaskResult) {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        await prisma.collectSession.update({
          where: { id: sessionId },
          data: {
            totalTasks: { increment: 1 },
            successTasks: task.success ? { increment: 1 } : undefined,
            failedTasks: !task.success ? { increment: 1 } : undefined
          }
        })

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
      })
    } catch (e) {
      const error = e as Error
      logger.error(
        `수집 이력 생설 실패 [url=${task.url}, message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `수집 이력 생설 실패 [url=${task.url}, message=${error.message}]`
      })
    }
  }
}

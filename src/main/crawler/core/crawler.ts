import puppeteer from 'puppeteer-extra'
import { CrawlerExecuteOptions } from '@main/crawler/core/types'
import { extendPage } from '@main/crawler/core/extension'
import { Browser } from 'puppeteer'
import { PrismaService } from '@main/prisma.service'
import { Logger } from '@nestjs/common'
import { sendLog, sendToBrowser } from '@main/controller/crawler.controller'
import { delay } from '@/lib'
import { IPC_KEYS } from '@/lib/constant'
import { Notification } from 'electron'
import { ExecutionType } from '@main/generated/prisma/client'
import { getLocalDate } from '@main/lib/utils'

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
  protected taskTimeoutInSeconds = 1800

  constructor(protected prismaService: PrismaService) {}

  protected abstract waitForFinishCondition(): boolean

  public async waitForFinish() {
    let second = 0
    while (true) {
      if (this.waitForFinishCondition()) {
        logger.log('크롤러 작업이 모두 완료되었습니다.')
        sendToBrowser(IPC_KEYS.crawler.finish, true)
        return Promise.resolve()
      }
      await delay(1000)
      second++
      if (second >= this.taskTimeoutInSeconds) {
        return Promise.reject(new Error('크롤러 실행 시간이 초과되었습니다.'))
      }
      logger.log(`크롤러 작업 대기 중... ${second}초 경과`)
    }
  }

  async start(options?: CrawlerExecuteOptions): Promise<string> {
    await this.stop()
    this.browser = await initBrowser(options)
    const sessionId = await this.run(options)
    // 세션 종료 처리
    this.finalizeSession(sessionId)
    return sessionId
  }

  async stop(sessionId?: string): Promise<void> {
    if (sessionId) {
      try {
        await this.prismaService.collectSession.update({
          where: { id: sessionId },
          data: {
            status: 'TERMINATED',
            finishedAt: getLocalDate()
          }
        })
        logger.log(`[크롤러] 세션 중지됨 [id=${sessionId}]`)
        sendLog({
          type: 'info',
          message: `수집이 사용자에 의해 중지되었습니다. (세션 ID: ${sessionId.substring(0, 8)}...)`
        })
      } catch (e) {
        const error = e as Error
        logger.error(
          `[크롤러] 세션 종료 실패 [sessionId=${sessionId}, message=${error.message}]`,
          error.stack
        )
      }
    }

    // 브라우저 종료
    if (this.browser) {
      await this.browser.close()
      this.browser = undefined
    }
  }

  abstract run(options?: CrawlerExecuteOptions): Promise<string>

  protected async createSessionHistory(
    entryUrl: string,
    executionType: ExecutionType = 'MANUAL'
  ): Promise<string> {
    const id = crypto.randomUUID()
    try {
      await this.prismaService.collectSession.create({
        data: {
          id: id,
          entryUrl: entryUrl,
          executionType: executionType,
          totalTasks: 0,
          successTasks: 0,
          failedTasks: 0,
          startedAt: getLocalDate(),
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
    await delay(3000)
    await this.waitForFinish()

    try {
      const session = await this.prismaService.collectSession.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        logger.warn(`[크롤러] 세션을 찾을 수 없음 [${sessionId}]`)
        return
      }

      await this.prismaService.collectSession.update({
        where: { id: sessionId },
        data: {
          finishedAt: getLocalDate(),
          status: session.status === 'TERMINATED' ? 'TERMINATED' : 'COMPLETED'
        }
      })

      logger.log(
        `[크롤러] 수집 세션 종료 [id=${sessionId}, total=${session.totalTasks}, success=${session.successTasks}, failed=${session.failedTasks}]`
      )
      sendLog({
        message: `수집 완료 [전체: ${session.totalTasks}, 성공: ${session.successTasks}, 실패: ${session.failedTasks}]`
      })

      await this.stop()

      const option = await this.prismaService.setting.findUnique({
        where: { key: 'USE_ALERT_ON_FINISH' }
      })
      if (option?.value === 'Y') {
        new Notification({ title: '수집 완료', body: '수집 작업이 완료 되었습니다.' }).show()
      }
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
}

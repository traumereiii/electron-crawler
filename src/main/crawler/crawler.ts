import puppeteer from 'puppeteer-extra'
import { CrawlerExecuteOptions, TabTaskErrorType, TabTaskResult } from '@main/crawler/types'
import { extendPage } from '@main/crawler/extension'
import { Browser } from 'puppeteer'
import { Record } from '@prisma/client/runtime/client'
import { EventEmitter } from 'node:events'
import { PrismaService } from '@main/prisma.service'
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

export async function initBrowser(options?: CrawlerExecuteOptions) {
  const browser = await puppeteer.launch({
    headless: options?.headless ?? true,
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

export abstract class Crawler {
  protected browser: Browser | undefined

  constructor(prismaService: PrismaService) {}

  async start(options?: CrawlerExecuteOptions): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close()
        this.browser = await initBrowser(options)
      }
      this.run(options?.params)
    } catch (e) {
      // TODO
    }
  }

  abstract run(params?: Record<string, any>): Promise<void>

  protected async saveHistory(task: TabTaskResult) {
    try {
      await this.prismaService.collect.create({
        data: {
          id: task.id,
          parent: task.parent,
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
    } catch (e) {
      // TODO 에러처리
      console.error(e)
    }
  }
}

import { Page } from 'puppeteer-core'
import { TabPool } from './core/tab-pool'
import { CapturedImage, CrawlerExecuteOptions, TabTask } from '@main/crawler/core/types'
import './core/extension'
import { Crawler } from '@main/crawler/core/crawler'
import { PrismaService } from '@main/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { NaverStockParser } from '@main/parser/naver-stock.parser'
import { sendStat } from '@main/controller/crawler.controller'

@Injectable()
export class NaverStockCrawler extends Crawler {
  private readonly ENTRY_URL = 'https://finance.naver.com/sise/theme.naver'

  private tabPool1: TabPool | null = null
  private tabPool2: TabPool | null = null
  private tabPool3: TabPool | null = null

  constructor(
    @Inject(PrismaService) private readonly _prismaService: PrismaService,
    @Inject(NaverStockParser) private readonly naverStockParser: NaverStockParser
  ) {
    super(_prismaService)
  }

  private async initTabPools(options?: CrawlerExecuteOptions) {
    this.tabPool1 = new TabPool(
      this.browser!,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[0] : 2
    )
    this.tabPool2 = new TabPool(
      this.browser!,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[1] : 2
    )
    this.tabPool3 = new TabPool(
      this.browser!,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[2] : 20
    )
  }

  async run(options?: CrawlerExecuteOptions) {
    const sessionId = await this.createSessionHistory(this.ENTRY_URL)

    const defaultSuccessHandler = this.defaultSuccessHandler(sessionId)
    const successHandler = async (task, result) => {
      await defaultSuccessHandler(task, result)
      sendStat({ id: sessionId, success: true })
    }

    const defaultErrorHandler = this.defaultErrorHandler(sessionId)
    const errorHandler = async (error: Error, _, result) => {
      await defaultErrorHandler(error, _, result)
      sendStat({ id: sessionId, success: false })
    }

    await this.initTabPools(options)

    // const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const pageNumbers = [1]

    /** 3. 주식 상세 페이지 **/
    const handleStockPage = async (stockPage: Page, _: CapturedImage[], task: TabTask) => {
      this.naverStockParser.start({
        collectTask: task.id,
        url: task.url,
        html: await stockPage.content()
      })
    }

    /** 2. 테마 페이지 **/
    const handleThemePage = async (themePage: Page, _: CapturedImage[], task: TabTask) => {
      const stockUrls = await themePage.$$href('table.type_5 div.name_area a')

      for (const stockUrl of stockUrls) {
        /** 3. 주식 상세 페이지 **/
        this.tabPool3!.runAsync({
          parentId: task.id,
          label: '주식 상세 정보 수집',
          url: `https://finance.naver.com${stockUrl}`,
          screenshot: false,
          captureImages: true,
          onPageLoaded: handleStockPage,
          onSuccess: successHandler,
          onError: errorHandler
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    const handleThemeListPage = async (themeListPage: Page, _: CapturedImage[], task: TabTask) => {
      const themeUrls = await themeListPage.$$href('table.type_1 td.col_type1 a')

      for (const themeUrl of themeUrls) {
        this.tabPool2!.runAsync({
          parentId: task.id,
          label: '테마 정보 수집',
          url: `https://finance.naver.com${themeUrl}`,
          screenshot: false,
          onPageLoaded: handleThemePage,
          onSuccess: successHandler,
          onError: errorHandler
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    await this.tabPool1!.runAsyncMulti(
      pageNumbers.map((pageNumber) => ({
        label: '주식 테마 URL 수집',
        url: `${this.ENTRY_URL}?&page=${pageNumber}`,
        screenshot: false,
        onPageLoaded: handleThemeListPage,
        onSuccess: successHandler,
        onError: errorHandler
      }))
    )
    // end of 주식 테마 목록 페이지

    console.log('================================================')
    console.log('================================================')
    console.log('작업완료')
  }
}

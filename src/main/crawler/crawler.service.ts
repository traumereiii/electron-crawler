import { Page } from 'puppeteer-core'
import { TabPool } from './tab-pool'
import { CapturedImage, CrawlerExecuteOptions, TabTask } from '@main/crawler/types'
import './extension'
import { Crawler, initBrowser } from '@main/crawler/crawler'
import { PrismaService } from '@main/prisma.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class CrawlerService extends Crawler {
  private readonly ENTRY_URL = 'https://finance.naver.com/sise/theme.naver'

  private tabPool1: TabPool | null = null
  private tabPool2: TabPool | null = null
  private tabPool3: TabPool | null = null

  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {
    super(prismaService)
  }

  private async initTabPools(options?: CrawlerExecuteOptions) {
    if (this.browser) {
      await this.browser.close()
    }
    this.browser = await initBrowser(options)

    this.tabPool1 = new TabPool(
      this.browser,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[0] : 2
    )
    this.tabPool2 = new TabPool(
      this.browser,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[1] : 2
    )
    this.tabPool3 = new TabPool(
      this.browser,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[2] : 20
    )
  }

  async run(options?: CrawlerExecuteOptions) {
    const masterId = await this.createMasterHistory(this.ENTRY_URL)
    const succesHandler = this.defaultSuccessHandler(masterId)
    const errorHandler = this.defaultErrorHandler(masterId)

    await this.initTabPools(options)

    const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    /** 3. 주식 상세 페이지 **/
    const handleStockPage = async (stockPage: Page, _: CapturedImage[]) => {
      const $ = await stockPage.toCheerio()
      const name = $('div.wrap_company a').text()
      const per = $('#_per').text()
      const eps = $('#_eps').text()
      const pbr = $('#_pbr').text()

      const newVar = await stockPage.$('#rate_info_krx .sp_txt10')
      const em = await newVar?.siblings('em')

      // 파싱 및 저장
      console.log({
        name: name?.trim(),
        per: per?.trim(),
        eps: eps?.trim(),
        pbr: pbr?.trim(),
        em: await em![0]?.textContent()
      })
    }

    /** 2. 테마 페이지 **/
    const handleThemePage = async (themePage: Page, _: CapturedImage[], task: TabTask) => {
      const stockUrls = await themePage.$$href('table.type_5 div.name_area a')

      for (const stockUrl of stockUrls) {
        /** 3. 주식 상세 페이지 **/
        this.tabPool3!.runAsync({
          parent: task.id,
          label: '주식 상세 정보 수집',
          url: `https://finance.naver.com${stockUrl}`,
          screenshot: true,
          captureImages: true,
          onPageLoaded: handleStockPage,
          onError: errorHandler
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    const handleThemeListPage = async (themeListPage: Page, _: CapturedImage[], task: TabTask) => {
      const themeUrls = await themeListPage.$$href('table.type_1 td.col_type1 a')

      for (const themeUrl of themeUrls) {
        this.tabPool2!.runAsync({
          parent: task.id,
          label: '테마 정보 수집',
          url: `https://finance.naver.com${themeUrl}`,
          screenshot: true,
          onPageLoaded: handleThemePage,
          onSuccess: succesHandler,
          onError: errorHandler
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    this.tabPool1!.runAsyncMulti(
      pageNumbers.map((pageNumber) => ({
        label: '주식 테마 URL 수집',
        url: `${this.ENTRY_URL}?&page=${pageNumber}`,
        screenshot: true,
        onPageLoaded: handleThemeListPage,
        onSuccess: succesHandler,
        onError: errorHandler
      }))
    )
  }
}

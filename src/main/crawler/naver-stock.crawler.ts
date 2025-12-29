import { Page } from 'puppeteer-core'
import { TabPool } from './core/tab-pool'
import { CapturedImage, CrawlerExecuteOptions, TabTask } from '@main/crawler/core/types'
import './core/extension'
import { Crawler } from '@main/crawler/core/crawler'
import { PrismaService } from '@main/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { NaverStockParser } from '@main/parser/naver-stock.parser'
import { sendData, sendStat, sendToBrowser } from '@main/controller/crawler.controller'
import { IPC_KEYS } from '@/lib/constant'

@Injectable()
export class NaverStockCrawler extends Crawler {
  private readonly BASE_URL = 'https://finance.naver.com'
  private readonly ENTRY_URL = `${this.BASE_URL}/sise/theme.naver`

  private tabPool1: TabPool | null = null
  private tabPool2: TabPool | null = null
  private tabPool3: TabPool | null = null

  constructor(
    @Inject(PrismaService) private readonly _prismaService: PrismaService,
    @Inject(NaverStockParser) private readonly naverStockParser: NaverStockParser
  ) {
    super(_prismaService)
  }

  protected waitForFinishCondition(): boolean {
    return !!(this.tabPool1?.isIdle() && this.tabPool2?.isIdle() && this.tabPool3?.isIdle())
  }

  private async initTabPools(options?: CrawlerExecuteOptions) {
    console.log(options)
    this.tabPool1 = new TabPool(
      this._prismaService,
      this.browser!,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[0] : 2
    )
    this.tabPool2 = new TabPool(
      this._prismaService,
      this.browser!,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[1] : 4
    )
    this.tabPool3 = new TabPool(
      this._prismaService,
      this.browser!,
      options?.maxConcurrentTabs ? options.maxConcurrentTabs[2] : 5
    )
  }

  async run(options?: CrawlerExecuteOptions): Promise<string> {
    const sessionId = await this.createSessionHistory(this.ENTRY_URL)
    sendToBrowser(IPC_KEYS.crawler.session, sessionId)

    await this.initTabPools(options)

    // params에서 pageNumbers 가져오기 (기본값 유지)
    // const pageNumbers = options?.params?.pageNumbers ?? [1, 2, 3, 4]
    const pageNumbers = [1]

    /** 2. 테마 페이지 **/
    const handleThemePage = async (themePage: Page, _: CapturedImage[], task: TabTask) => {
      // if (nextBoolean()) {
      //   throw new Error('랜덤 에러 발생')
      // }
      const stockUrls = await themePage.$$href('table.type_5 div.name_area a')

      for (const stockUrl of stockUrls) {
        /** 3. 주식 상세 페이지 **/
        this.tabPool3!.runAsync({
          sessionId,
          parentId: task.id,
          label: '주식 상세 정보 수집',
          url: `${this.BASE_URL}${stockUrl}`,
          screenshot: options?.screenshot,
          captureImages: true,
          onSuccess: async (task, result) => {
            if (result.html) {
              this.naverStockParser.start({
                sessionId: sessionId,
                taskId: task.id,
                url: task.url,
                html: result.html,
                onSuccess: async (request, parsingResult) => {
                  console.log(`[Parser] OnSuccess called for ${request.url}`)
                  const data = parsingResult.data
                  await this._prismaService.stock.upsert({
                    where: {
                      code_sessionId: {
                        code: data.code,
                        sessionId: data.sessionId
                      }
                    },
                    create: data,
                    update: data
                  })
                  sendData({
                    code: data.code,
                    name: data.name,
                    price: Number(data.price),
                    volume: Number(data.volume),
                    tradingValue: Number(data.tradingValue),
                    marketCap: Number(data.marketCap.toString()),
                    per: Number(data.per.toString()),
                    eps: Number(data.eps.toString()),
                    pbr: Number(data.pbr.toString())
                  })
                  console.log(`[파싱] 파싱 성공 [${request.url}] [${parsingResult.data.name}]`)
                },
                onFail: async (request, parsingResult) => {
                  console.log(`[파싱] 파싱 실패 [${request.url}]`)
                }
              })
            }

            sendStat({ id: sessionId, success: true })
          },
          onError: async (error: Error, _, result) => sendStat({ id: sessionId, success: false })
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    const handleThemeListPage = async (themeListPage: Page, _: CapturedImage[], task: TabTask) => {
      const themeUrls = await themeListPage.$$href('table.type_1 td.col_type1 a')
      themeUrls.splice(0, 38)

      for (const themeUrl of themeUrls) {
        this.tabPool2!.runAsync({
          sessionId,
          parentId: task.id,
          label: '테마 정보 수집',
          url: `${this.BASE_URL}${themeUrl}`,
          screenshot: options?.screenshot,
          onPageLoaded: handleThemePage,
          onError: async (error: Error, _, result) => sendStat({ id: sessionId, success: false })
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    this.tabPool1!.runAsyncMulti(
      pageNumbers.map((pageNumber) => ({
        sessionId,
        label: '주식 테마 URL 수집',
        url: `${this.ENTRY_URL}?&page=${pageNumber}`,
        screenshot: options?.screenshot,
        onPageLoaded: handleThemeListPage,
        onError: async (error: Error, _, result) => sendStat({ id: sessionId, success: false })
      }))
    )

    return sessionId
  }
}

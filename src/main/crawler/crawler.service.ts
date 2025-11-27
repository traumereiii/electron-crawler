import puppeteer from 'puppeteer-extra'
import { Page } from 'puppeteer-core'
import { TabPool } from './tab-pool'
import { delay } from '@/lib'
import { Browser } from 'puppeteer'
import { CapturedImage, CrawlerExecuteOptions } from '@main/crawler/types'
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

export class CrawlerService {
  private browser: Browser | null = null
  private tabPool1: TabPool | null = null
  private tabPool2: TabPool | null = null
  private tabPool3: TabPool | null = null

  private async initTabPools(options?: CrawlerExecuteOptions) {
    if (this.browser) {
      await this.browser.close()
    }
    this.browser = await puppeteer.launch({
      headless: options?.headless ?? true,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--window-size=${options?.width || 1280},${options?.height || 720}`
      ]
      // size of browser
    })
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
    await this.initTabPools(options)

    const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    /** 3. 주식 상세 페이지 **/
    const handleStockPage = async (stockPage: Page, capturedImages: CapturedImage[]) => {
      const stockName = await stockPage.textContent('div.wrap_company a')
      // 파싱 및 저장
      console.log(capturedImages)
    }

    /** 2. 테마 페이지 **/
    const handleThemePage = async (themePage: Page) => {
      const stockUrls = await themePage.$$href('table.type_5 div.name_area a')

      for (const stockUrl of stockUrls) {
        /** 3. 주식 상세 페이지 **/
        this.tabPool3!.runAsync({
          id: crypto.randomUUID(),
          label: '주식 상세 정보 수집',
          url: `https://finance.naver.com${stockUrl}`,
          captureImages: true,
          onPageLoaded: handleStockPage,
          onSuccess: () => {},
          onError: async (error) => {
            console.error('탭 작업 중 에러 발생', error)
            // 렌더러로 메세지 전송
          }
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    const handleThemeListPage = async (themeListPage: Page) => {
      const themeUrls = await themeListPage.$$href('table.type_1 td.col_type1 a')

      for (const themeUrl of themeUrls) {
        this.tabPool2!.runAsync({
          id: crypto.randomUUID(),
          label: '테마 정보 수집',
          url: `https://finance.naver.com${themeUrl}`,
          onPageLoaded: handleThemePage,
          onError: async (error) => {
            console.error('탭 작업 중 에러 발생', error)
            // 렌더러로 메세지 전송
          }
        })
      }
    }

    /** 1. 테마 목록 페이지 **/
    this.tabPool1!.runAsyncMulti(
      pageNumbers.map((pageNumber) => ({
        id: crypto.randomUUID(),
        label: '주식 테마 URL 수집',
        url: `https://finance.naver.com/sise/theme.naver?&page=${pageNumber}`,
        onPageLoaded: handleThemeListPage,
        onSuccess: async (task, result) => {
          console.log(
            `테마 목록 페이지 작업 완료: ${task.url}, 페이지 이동 소요시간: ${result.spentTimeOnNavigateInMillis}ms, 작업 소요시간: ${result.spentTimeOnPageLoadedInMillis}ms`
          )
        },
        onError: async (error) => {
          console.error('탭 작업 중 에러 발생', error)
          // 렌더러로 메세지 전송
        }
      }))
    )

    await delay(1000 * 600)
  }
}

import puppeteer from 'puppeteer-extra'
import { Page } from 'puppeteer-core'
import { TabPool } from './tab-pool'
import { Browser } from 'puppeteer'
import { CapturedImage, Crawler, CrawlerExecuteOptions } from '@main/crawler/types'

const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

type BookDetailParam = {
  recKey: string
  bookKey: string
  publishFormCode: string
}

type BookListParam = {
  searchType?: string
  searchCategory?: string
  searchLibrary?: string
  searchLibraryArr?: string
  searchKdc: string
  searchSort?: string
  searchOrder?: string
  searchRecordCount?: number
  currentPageNo?: number
  viewStatus?: string
}

export class LibraryCrawlerService implements Crawler {
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
        `--window-size=${options?.width || 1600},${options?.height || 1200}`
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

    const searchKdcList: string[] = []

    // for (let kdc = 0; kdc <= 999; kdc++) {
    //   searchKdcList.push(kdc.toString().padStart(3, '0'))
    // }

    for (let kdc = 0; kdc <= 999; kdc++) {
      const searchKdc = kdc.toString().padStart(3, '0')

      const searchParams = this.getBookListParam({
        searchKdc: searchKdc
      })
      await this.tabPool1!.runSync({
        id: crypto.randomUUID(),
        label: '주제별 도서 목록',
        url: `https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdcResultList.do?&${searchParams.toString()}`,
        onPageLoaded: async (themeBookListPage): Promise<number> => {
          // https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchResultDetail.do?

          return 1
        },
        onError: async (error) => {
          console.error('탭 작업 중 에러 발생', error)
          // 렌더러로 메세지 전송
        }
      })
    }
  }

  private getBookListParam(param: BookListParam) {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append('searchType', param.searchType ? param.searchType : 'KDC')
    urlSearchParams.append('searchCategory', param.searchCategory ? param.searchCategory : 'ALL')
    urlSearchParams.append('searchLibrary', param.searchLibrary ? param.searchLibrary : '')
    urlSearchParams.append(
      'searchLibraryArr',
      param.searchLibraryArr ? param.searchLibraryArr : 'MB'
    )
    urlSearchParams.append('searchKdc', param.searchKdc)
    urlSearchParams.append('searchSort', param.searchSort ? param.searchSort : 'SIMILAR')
    urlSearchParams.append('searchOrder', param.searchOrder ? param.searchOrder : 'DESC')
    urlSearchParams.append(
      'searchRecordCount',
      param.searchRecordCount ? param.searchRecordCount.toString() : '100'
    )
    urlSearchParams.append(
      'currentPageNo',
      param.currentPageNo ? param.currentPageNo.toString() : '1'
    )
    urlSearchParams.append('viewStatus', param.viewStatus ? param.viewStatus : 'IMAGE')
    return urlSearchParams
  }

  private getBookDetailParam(param: BookDetailParam) {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append('recKey', param.recKey)
    urlSearchParams.append('bookKey', param.bookKey)
    urlSearchParams.append('publishFormCode', param.publishFormCode)
    return urlSearchParams
  }
}

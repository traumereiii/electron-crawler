import '../../global.d.ts'
import './core/extension'
import { NaverStockCrawler } from './naver-stock.crawler'
import { delay } from '@/lib'
import { PrismaService } from '@main/prisma.service'

describe('NaverStockCrawler', () => {
  // const crawlerService = new NaverStockCrawler({} as PrismaService)
  //
  // it(
  //   'should be defined',
  //   async () => {
  //     await crawlerService.run({
  //       maxConcurrentTabs: [3, 3, 6],
  //       headless: false
  //     })
  //     await delay(1000 * 600)
  //   },
  //   1000 * 600
  // )
})

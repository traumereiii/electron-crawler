import '../../global.d.ts'
import './extension'
import { CrawlerService } from './crawler.service'
import { delay } from '@/lib'
import { PrismaService } from '@main/prisma.service'

describe('CrawlerService', () => {
  const crawlerService = new CrawlerService({} as PrismaService)

  it(
    'should be defined',
    async () => {
      await crawlerService.run({
        maxConcurrentTabs: [3, 3, 6],
        headless: false
      })
      await delay(1000 * 600)
    },
    1000 * 600
  )
})

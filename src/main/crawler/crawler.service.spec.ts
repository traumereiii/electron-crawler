import '../../global.d.ts'
import './extension'
import { CrawlerService } from './crawler.service'
import { delay } from '@/lib'

describe('CrawlerService', () => {
  const crawlerService = new CrawlerService()

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

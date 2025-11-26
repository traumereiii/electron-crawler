import '../../global.d.ts'
import './extension'
import { CrawlerService } from './crawler.service'

describe('CrawlerService', () => {
  const crawlerService = new CrawlerService()

  it(
    'should be defined',
    async () => {
      await crawlerService.run()
    },
    1000 * 30
  )
})

import './extension'
import { Module } from '@nestjs/common'
import { CrawlerService } from '@main/crawler/crawler.service'

@Module({
  imports: [],
  controllers: [],
  providers: [CrawlerService]
})
export class CrawlerModule {}

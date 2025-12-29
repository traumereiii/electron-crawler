import './core/extension'
import { Module } from '@nestjs/common'
import { NaverStockCrawler } from '@main/crawler/naver-stock.crawler'
import { ParserModule } from '@main/parser/parser.module'
import { CollectHistoryService } from '@main/crawler/service/collect-history.service'

@Module({
  imports: [ParserModule],
  providers: [NaverStockCrawler, CollectHistoryService],
  exports: [NaverStockCrawler]
})
export class CrawlerModule {}

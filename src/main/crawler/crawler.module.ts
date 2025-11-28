import './extension'
import { Module } from '@nestjs/common'
import { CrawlerService } from '@main/crawler/crawler.service'
import { ParserModule } from '@main/parser/parser.module'

@Module({
  imports: [ParserModule],
  providers: [CrawlerService]
})
export class CrawlerModule {}

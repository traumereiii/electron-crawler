import { Module } from '@nestjs/common'
import { ErrorHandler } from '@main/handler/error.handler'
import { CrawlerModule } from '@main/crawler/crawler.module'
import { GlobalModule } from '@main/global.module'
import { ParserModule } from '@main/parser/parser.module'
import { ExcelService } from '@main/service/excel.service'
import { DatabaseService } from '@main/service/database.service'
import { SettingsService } from '@main/service/settings.service'
import { AutoDeleteService } from '@main/service/auto-delete.service'
import { InquiryService } from '@main/service/inquiry.service'
import { SchedulingModule } from '@main/scheduling/scheduling.module'

@Module({
  imports: [CrawlerModule, ParserModule, GlobalModule, SchedulingModule],
  controllers: [],
  providers: [
    ExcelService,
    DatabaseService,
    SettingsService,
    AutoDeleteService,
    InquiryService,
    ErrorHandler
  ]
})
export class AppModule {}

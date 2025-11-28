import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { UsersService } from './user.service'
import { ErrorHandler } from '@main/handler/error.handler'
import { CrawlerModule } from '@main/crawler/crawler.module'
import { GlobalModule } from '@main/global.module'

@Module({
  imports: [CrawlerModule, GlobalModule],
  controllers: [],
  providers: [AppService, UsersService, ErrorHandler]
})
export class AppModule {}

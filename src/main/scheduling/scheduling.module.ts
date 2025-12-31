import { Module } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { ScheduleService } from './schedule.service'
import { ScheduleExecutorService } from './schedule-executor.service'
import { ScheduleJobManager } from './schedule-job-manager'
import { PostActionHandler } from './post-action-handler'
import { CrawlerModule } from '@main/crawler/crawler.module'
import { ExcelService } from '@main/service/excel.service'
import { AutoDeleteService } from '@main/service/auto-delete.service'
import { SettingsService } from '@main/service/settings.service'

@Module({
  imports: [CrawlerModule],
  providers: [
    PrismaService,
    ExcelService,
    ScheduleService,
    ScheduleExecutorService,
    ScheduleJobManager,
    PostActionHandler,
    AutoDeleteService,
    SettingsService
  ],
  exports: [ScheduleService, ScheduleExecutorService, ScheduleJobManager]
})
export class SchedulingModule {}

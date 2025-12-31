import '@main/controller/common.controller'
import '@main/controller/crawler.controller'
import { registerCrawlerIpc } from '@main/controller/crawler.controller'
import { registerCommonIpc } from '@main/controller/common.controller'
import { registerCollectHistoryIpc } from '@main/controller/collect-history.controller'
import { registerSchedulingIpc } from '@main/controller/scheduling.controller'
import { registerDatabaseIpc } from '@main/controller/database.controller'
import { registerSettingsIpc } from '@main/controller/settings.controller'
import { registerInquiryIpc } from '@main/controller/inquiry.controller'

export async function registerControllers() {
  await Promise.all([
    registerCrawlerIpc(),
    registerCommonIpc(),
    registerCollectHistoryIpc(),
    registerSchedulingIpc(),
    registerDatabaseIpc(),
    registerSettingsIpc(),
    registerInquiryIpc()
  ])
}

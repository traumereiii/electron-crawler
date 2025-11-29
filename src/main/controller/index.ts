import '@main/controller/sample.controller'
import '@main/controller/common.controller'
import '@main/controller/crawler.controller'
import { registerCrawlerIpc } from '@main/controller/crawler.controller'
import { registerCommonIpc } from '@main/controller/common.controller'

export async function registerControllers() {
  await Promise.all([registerCrawlerIpc(), registerCommonIpc()])
}

import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent
import { CrawlerService } from '@main/crawler/crawler.service'

const logger = new Logger('crawler.controller')

;(async () => {
  const nestApplication = await waitForNestAppReady()

  ipcMain.on(IPC_KEYS.request.post.startCrawling, async (_: IpcMainInvokeEvent, args) => {
    try {
      const crawlerService = nestApplication.get<CrawlerService>(CrawlerService)
      crawlerService.run()
    } catch (e) {}
  })
})()

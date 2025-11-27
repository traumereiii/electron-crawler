import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent
import { CrawlerService } from '@main/crawler/crawler.service'

const logger = new Logger('ipc-main')

;(async () => {
  const nestApplication = await waitForNestAppReady()

  ipcMain.on(IPC_KEYS.request.post.startCrawling, async (_: IpcMainInvokeEvent, args) => {
    try {
      logger.log(`Start crawling with args: ${JSON.stringify(args)}`)
      const crawlerService = nestApplication.get<CrawlerService>(CrawlerService)
      console.log('crawlerService: ', crawlerService)
      crawlerService.run()
    } catch (e) {
      errorHandler.handleMainError(mainError)
      mainWindow.webContents.send('realtime:event', {
        type: 'ping',
        time: new Date().toISOString()
      })
    }
  })
})()

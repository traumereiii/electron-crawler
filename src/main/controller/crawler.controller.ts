import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { CrawlerService } from '@main/crawler/crawler.service'
import { mainWindow } from '@/main'
import { Stock } from '@main/generated/prisma/client'

const logger = new Logger('crawler.controller')

export async function registerCrawlerIpc() {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.crawler.start, async () => {
    try {
      const crawlerService = nestApplication.get<CrawlerService>(CrawlerService)
      await crawlerService.start()
      sendLog({ type: 'info', message: '크롤러가 시작 되었습니다.' })
      return true
    } catch (e) {
      const error = e as Error
      logger.error(
        `[크롤러] 크롤러 시작 실패 [message=${error.message}, stack=${error.stack}]`,
        error.stack
      )
      sendLog({ type: 'error', message: '크롤러 시작에 실패 했습니다.' })
      return false
    }
  })

  ipcMain.handle(IPC_KEYS.crawler.stop, async () => {
    try {
      const crawlerService = nestApplication.get<CrawlerService>(CrawlerService)
      crawlerService.stop()
      sendLog({ type: 'info', message: '크롤러가 중지 되었습니다.' })
      return true
    } catch (e) {
      const error = e as Error
      logger.error(`[크롤러] 크롤러 중지 실패 [message=${error.message}]`, error.stack)
      sendLog({ type: 'error', message: '크롤러 중지에 실패 했습니다.' })
      return false
    }
  })
}

export function sendLog(message: any) {
  console.log('Sending log to renderer:', message)
  mainWindow.webContents.send(IPC_KEYS.crawler.message, message)
}

export function sendData(data: any) {
  mainWindow.webContents.send(IPC_KEYS.crawler.data, data)
}

export function sendStat(stat: { id: string; success: boolean }) {
  mainWindow.webContents.send(IPC_KEYS.crawler.stat, stat)
}

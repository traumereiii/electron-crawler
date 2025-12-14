import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { NaverStockCrawler } from '@main/crawler/naver-stock.crawler'
import { mainWindow } from '@/main'
import { CrawlerStartParams } from '@/lib/types'

const logger = new Logger('crawler.controller')

export async function registerCrawlerIpc() {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.crawler.start, async (_event, params: CrawlerStartParams) => {
    try {
      const crawler = nestApplication.get<NaverStockCrawler>(NaverStockCrawler)

      // CrawlerExecuteOptions로 변환
      await crawler.start({
        headless: params.headless,
        width: params.width,
        height: params.height,
        maxConcurrentTabs: params.maxConcurrentTabs,
        params: {
          pageNumbers: params.pageNumbers
        }
      })

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
      const crawler = nestApplication.get<NaverStockCrawler>(NaverStockCrawler)
      crawler.stop()
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
  //console.log('Sending log to renderer:', message)
  mainWindow.webContents.send(IPC_KEYS.crawler.message, message)
}

export function sendData(data: any) {
  mainWindow.webContents.send(IPC_KEYS.crawler.data, data)
}

export function sendStat(stat: { id: string; success: boolean }) {
  mainWindow.webContents.send(IPC_KEYS.crawler.stat, stat)
}

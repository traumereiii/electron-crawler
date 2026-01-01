import { ipcMain, shell } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { NaverStockCrawler } from '@main/crawler/naver-stock.crawler'
import { mainWindow } from '@/main'
import { CrawlerStartParams } from '@/lib/types'
import { ExcelService } from '@main/service/excel.service'
import { PrismaService } from '@main/prisma.service'
import { Stock } from '@main/generated/prisma/client'

const logger = new Logger('crawler.controller')

export async function registerCrawlerIpc() {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.crawler.start, async (_event, params: CrawlerStartParams) => {
    try {
      const crawler = nestApplication.get<NaverStockCrawler>(NaverStockCrawler)

      // CrawlerExecuteOptions로 변환 및 세션 ID 받기
      const sessionId = await crawler.start({
        headless: params.headless,
        screenshot: params.screenshot,
        width: params.width,
        height: params.height,
        maxConcurrentTabs: params.maxConcurrentTabs,
        params: {
          pageNumbers: params.pageNumbers
        }
      })
      sendLog({ type: 'info', message: '크롤러가 시작 되었습니다.' })
      return { success: true, sessionId }
    } catch (e) {
      const error = e as Error
      logger.error(
        `[크롤러] 크롤러 시작 실패 [message=${error.message}, stack=${error.stack}]`,
        error.stack
      )
      sendLog({ type: 'error', message: '크롤러 시작에 실패 했습니다.' })
      return { success: false }
    }
  })

  ipcMain.handle(IPC_KEYS.crawler.stop, async (_event, sessionId?: string) => {
    try {
      const crawler = nestApplication.get<NaverStockCrawler>(NaverStockCrawler)
      await crawler.stop(sessionId)
      return true
    } catch (e) {
      const error = e as Error
      logger.error(`[크롤러] 크롤러 중지 실패 [message=${error.message}]`, error.stack)
      sendLog({ type: 'error', message: '크롤러 중지에 실패 했습니다.' })
      return false
    }
  })

  ipcMain.handle(IPC_KEYS.crawler.excel, async (_event, sessionId: string) => {
    try {
      const prismaService = nestApplication.get<PrismaService>(PrismaService)
      const excelService = nestApplication.get<ExcelService>(ExcelService)

      if (!sessionId) {
        sendLog({ type: 'warning', message: '선택된 세션이 없습니다.' })
        return false
      }

      // 세션 존재 확인
      const session = await prismaService.collectSession.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        sendLog({ type: 'warning', message: '해당 세션을 찾을 수 없습니다.' })
        return false
      }

      // 해당 세션의 stock 데이터 조회
      const stocks = await prismaService.stock.findMany({
        where: { sessionId },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (stocks.length === 0) {
        sendLog({ type: 'warning', message: '내보낼 데이터가 없습니다.' })
        return false
      }

      const filePath = await excelService.create<Stock>(stocks)
      sendLog({
        type: 'success',
        message: `${stocks.length}개의 주식 데이터를 엑셀로 내보냈습니다.`
      })

      // 저장된 폴더 열기
      shell.showItemInFolder(filePath)

      return filePath
    } catch (e) {
      const error = e as Error
      logger.error(`[크롤러] 엑셀 내보내기 [message=${error.message}]`, error.stack)
      sendLog({ type: 'error', message: '엑셀 파일 생성에 실패 했습니다.' })
      return null
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

export function sendToBrowser(channel: string, data: any) {
  mainWindow.webContents.send(channel, data)
}

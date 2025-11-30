import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { CollectHistoryService } from '@main/crawler/service/collect-history.service'

const logger = new Logger('collect-history.controller')

export async function registerCollectHistoryIpc() {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.history.getSessions, async () => {
    try {
      const collectHistoryService =
        nestApplication.get<CollectHistoryService>(CollectHistoryService)

      return collectHistoryService.getSessions()
    } catch (e) {
      const error = e as Error
      logger.error(
        `[CollectHistoryController] 수집 이력 조회 실패 [message=${error.message}, stack=${error.stack}]`,
        error.stack
      )
      return []
    }
  })

  ipcMain.handle(IPC_KEYS.history.getTasks, async (_, { sessionId }: { sessionId?: string }) => {
    try {
      const collectHistoryService =
        nestApplication.get<CollectHistoryService>(CollectHistoryService)

      return collectHistoryService.getTasks(sessionId)
    } catch (e) {
      const error = e as Error
      logger.error(
        `[CollectHistoryController] 수집 작업 이력 조회 실패 [message=${error.message}, stack=${error.stack}]`,
        error.stack
      )
      return []
    }
  })

  ipcMain.handle(IPC_KEYS.history.getParsings, async (_) => {
    try {
      const collectHistoryService =
        nestApplication.get<CollectHistoryService>(CollectHistoryService)

      return collectHistoryService.getParsings()
    } catch (e) {
      const error = e as Error
      logger.error(
        `[CollectHistoryController] 파싱 이력 조회 실패 [message=${error.message}, stack=${error.stack}]`,
        error.stack
      )
      return []
    }
  })
}

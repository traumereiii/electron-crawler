import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { DatabaseService } from '@main/service/database.service'

const logger = new Logger('database.controller')

export async function registerDatabaseIpc() {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.database.clear, async () => {
    try {
      const databaseService = nestApplication.get<DatabaseService>(DatabaseService)
      await databaseService.clearDatabase()
      logger.log('[DatabaseController] 데이터베이스 정리 완료')
    } catch (e) {
      const error = e as Error
      logger.error(
        `[DatabaseController] 데이터베이스 정리 실패 [message=${error.message}]`,
        error.stack
      )
      throw error
    }
  })
}

import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { DatabaseService } from '@main/service/database.service'
import { ScheduleJobManager } from '@main/scheduling/schedule-job-manager'

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

  ipcMain.handle(IPC_KEYS.database.reloadAutoDelete, async () => {
    try {
      const scheduleJobManager = nestApplication.get<ScheduleJobManager>(ScheduleJobManager)
      await scheduleJobManager.reloadAutoDeleteJob()
      logger.log('[DatabaseController] 자동 삭제 Job 재등록 완료')
    } catch (e) {
      const error = e as Error
      logger.error(
        `[DatabaseController] 자동 삭제 Job 재등록 실패 [message=${error.message}]`,
        error.stack
      )
      throw error
    }
  })
}

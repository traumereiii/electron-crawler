import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { SettingsService } from '@main/service/settings.service'

const logger = new Logger('settings.controller')

export async function registerSettingsIpc() {
  const nestApplication = await waitForNestAppReady()

  // 모든 설정 조회
  ipcMain.handle(IPC_KEYS.settings.getAll, async () => {
    try {
      const settingsService = nestApplication.get<SettingsService>(SettingsService)
      return await settingsService.getAllSettings()
    } catch (e) {
      const error = e as Error
      logger.error(`[SettingsController] 설정 조회 실패 [message=${error.message}]`, error.stack)
      return {}
    }
  })

  // 설정 저장
  ipcMain.handle(IPC_KEYS.settings.set, async (_, settings: Record<string, string>) => {
    try {
      const settingsService = nestApplication.get<SettingsService>(SettingsService)
      await settingsService.setSettings(settings)
      logger.log('[SettingsController] 설정 저장 완료')
    } catch (e) {
      const error = e as Error
      logger.error(`[SettingsController] 설정 저장 실패 [message=${error.message}]`, error.stack)
      throw error
    }
  })
}

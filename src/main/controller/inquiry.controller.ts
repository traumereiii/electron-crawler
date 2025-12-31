import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { ipcMain, shell } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { InquiryService } from '@main/service/inquiry.service'

const logger = new Logger('inquiry.controller')

export async function registerInquiryIpc() {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.inquiry.exportLogs, async () => {
    try {
      const inquiryService = nestApplication.get<InquiryService>(InquiryService)
      const zipFilePath = await inquiryService.exportLogs()

      logger.log('[InquiryController] 로그 압축 완료:', zipFilePath)

      // 파일 탐색기에서 파일 위치 표시
      shell.showItemInFolder(zipFilePath)

      return zipFilePath
    } catch (e) {
      const error = e as Error
      logger.error(`[InquiryController] 로그 압축 실패 [message=${error.message}]`, error.stack)
      throw error
    }
  })
}

import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent
import { mainWindow } from '@/main'

const logger = new Logger('ipc-main')

;(async () => {
  const nestApplication = await waitForNestAppReady()

  ipcMain.handle(IPC_KEYS.request.get.test, async (_: IpcMainInvokeEvent, args) => {
    console.log('isBlank Test:', 'hello'.isBlank())
    logger.log('request.get.test called: ', args)
    throw new Error('메인 에러 테스트')
  })
})()

setInterval(() => {
  console.log('tik tok')
  mainWindow.webContents.send('realtime:event', { type: 'ping', time: new Date().toISOString() })
}, 1000)

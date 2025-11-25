import { ipcMain } from 'electron'
import { UsersService } from '../user.service'
import { Logger } from '@nestjs/common'
import { nestApplication } from '../main'
import { mainWindow } from '@/main'
import { IPC_EVENT_KEYS } from '@/lib/constant'

const logger = new Logger('ipc-handler.ts')

/**
 * ipcMain: 메인 프로세스 수신용
 * ipcRenderer: 렌더러 프로세스 수신 & 발신
 */

ipcMain.handle('realtime:start', () => {
  console.log('realtime:start invoked')
  startRealtimePush()
  return { ok: true }
})

ipcMain.handle('realtime:stop', () => {
  console.log('realtime:stop invoked')
  stopRealtimePush()
  return { ok: true }
})

// IPC test
ipcMain.on('action1', async (_, param) => {
  console.log('action1', param)
  const usersService = nestApplication.get(UsersService)
  try {
    await usersService.createUser({ email: param })
  } catch (e) {
    logger.error(e)
    mainWindow?.webContents.send(IPC_EVENT_KEYS.api.onError, { message: e.message })
  }
})

ipcMain.handle('action2', async (_, param) => {
  console.log('action2: ', param)
  const usersService = nestApplication.get(UsersService)
  return { success: true, users: await usersService.users({}) }
})

ipcMain.handle('action3', async (_, param) => {
  console.log('action3: ', param)
  return { message: JSON.stringify(process) }
})

let timer: NodeJS.Timeout | null = null
function startRealtimePush() {
  if (timer) return

  timer = setInterval(() => {
    // ✅ 백엔드에서 실시간으로 보내고 싶은 데이터
    const payload = {
      type: 'tick',
      time: new Date().toISOString(),
      ramdom: Math.floor(Math.random() * 1000)
    }

    // ✅ 웹소켓처럼 renderer로 push
    mainWindow?.webContents.send('realtime:event', payload)
  }, 1000)
}

function stopRealtimePush() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

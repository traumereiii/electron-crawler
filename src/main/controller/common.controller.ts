import { ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { waitForNestAppReady } from '@main/main'
import { ErrorHandler } from '@main/handler/error.handler'
import { IpcMainError } from '@/types'
;(async () => {
  const nestApplication = await waitForNestAppReady()
  const errorHandler = nestApplication.get<ErrorHandler>(ErrorHandler)

  ipcMain.on(IPC_KEYS.error.main, (_event, mainError: IpcMainError) => {
    console.error('Main Process Error:', mainError)
    errorHandler.handleMainError(mainError)
  })

  ipcMain.on(IPC_KEYS.error.renderer, (_event, rendererError: IpcMainError) => {
    console.error('Renderer Process Error:', rendererError)
    errorHandler.handleRendererError(rendererError)
  })
})()

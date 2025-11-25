import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Logger } from '@nestjs/common'
import { IPC_EVENT_KEYS } from '../lib/constant'

const logger = new Logger('preload.ts')

// Custom APIs for renderer
const api = {
  // ✅ 실시간 이벤트 구독
  onRealtimeEvent: (callback: (payload: any) => void) => {
    console.log('onRealtimeEvent invoked')
    const handler = (_: Electron.IpcRendererEvent, payload: any) => callback(payload)
    ipcRenderer.on('realtime:event', handler)

    // ✅ React에서 cleanup할 수 있도록 unsubscribe 반환
    return () => {
      ipcRenderer.removeListener('realtime:event', handler)
    }
  },
  realtimeStart: () => ipcRenderer.invoke('realtime:start'),
  realtimeStop: () => ipcRenderer.invoke('realtime:stop'),
  onError: (callback: (payload: { message: string }) => void) => {
    logger.log(`onError handler registered`)
    const handler = (_: Electron.IpcRendererEvent, payload: { message: string }) =>
      callback(payload)
    ipcRenderer.on(IPC_EVENT_KEYS.api.onError, handler)

    // ✅ React에서 cleanup할 수 있도록 unsubscribe 반환
    return () => {
      ipcRenderer.removeListener(IPC_EVENT_KEYS.api.onError, handler)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

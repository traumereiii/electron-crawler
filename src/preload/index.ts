import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_KEYS } from '../lib/constant'
import IpcRendererEvent = Electron.IpcRendererEvent

const isDev = process.env.NODE_ENV === 'development'
const listeners = new Map<string, (...args: any[]) => void>() // 리스너 저장

/**
 * 화면에서 메인 프로세스와 통신하기 위해 호출 하는 API
 */
const $renderer = {
  // ipcMain.on
  sendToMain: (channel: string, ...args: any[]) => {
    try {
      if (isDev) {
        console.log(`$sendToMain - [channel: ${channel}]`, args)
      }
      ipcRenderer.send(channel, args)
    } catch (error) {
      ipcRenderer.send(IPC_KEYS.error.main, {
        channel,
        error,
        args
      })
    }
  },

  onReceive: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    const listener = (event: IpcRendererEvent, ...receiveArgs: any[]) => {
      try {
        callback(event, ...receiveArgs)
      } catch (error) {
        console.error('Error in onReceive callback:', error)
        ipcRenderer.send(IPC_KEYS.error.renderer, {
          channel,
          error,
          receiveArgs
        })
      }
    }

    if (listeners.has(channel)) {
      ipcRenderer.removeListener(channel, listeners.get(channel)!)
      listeners.delete(channel)
    }

    listeners.set(channel, listener)
    ipcRenderer.on(channel, listener)
  },

  // ipcMain.handle
  request: async (channel: string, ...args: any[]) => {
    try {
      if (isDev) {
        console.log(`$request - [channel: ${channel}]`, args)
      }
      const result = await ipcRenderer.invoke(channel, ...args)
      if (isDev) {
        console.log(`$request result - [channel: ${channel}]`, result)
      }

      return result
    } catch (error) {
      console.error('Error in request:', error)
      ipcRenderer.send(IPC_KEYS.error.main, {
        channel,
        error,
        args
      })
    }
  },

  removeListener: (channel: string) => {
    const listener = listeners.get(channel)
    if (listener) {
      ipcRenderer.removeListener(channel, listener)
      listeners.delete(channel)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('$renderer', $renderer)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.$renderer = $renderer
}

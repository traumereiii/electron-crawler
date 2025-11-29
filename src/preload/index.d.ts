import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onRealtimeEvent: (cb: (payload: any) => void) => () => void
      realtimeStart: () => Promise<{ ok: boolean }>
      realtimeStop: () => Promise<{ ok: boolean }>
      onError: (cb: (payload: { message: string }) => void) => () => void
    }
    $renderer: {
      sendToMain: (channel: string, ...data: any[]) => void
      onReceive: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => void
      request: <T>(channel: string, ...args: any[]) => Promise<T>
      removeListener: (channel: string) => void
    }

  }
}

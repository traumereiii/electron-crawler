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
  }
}

export type IpcMainError = {
  channel: string
  error: Error
  args: any[]
}

export type IpcRendererError = {
  channel: string
  error: Error
  args: any[]
}

export type Log = {
  type: 'info' | 'success' | 'error'
  message: string
  timestamp?: string
}

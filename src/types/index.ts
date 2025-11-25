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

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

export interface CollectSession {
  id: string
  entryUrl: string
  executionType: 'MANUAL' | 'SCHEDULED_AUTO' | 'SCHEDULED_IMMEDIATE'
  startedAt: string
  finishedAt?: string
  totalTasks: number
  successTasks: number
  failedTasks: number
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED'
}

export interface CollectTask {
  id: string
  sessionId: string
  parentId: string | null
  url: string
  success: boolean
  screenshot: string | null
  startedAt: string
  spentTimeOnNavigateInMillis: number
  spentTimeOnPageLoadedInMillis: number
  error: string | null
  errorType: string | null
}

export interface Parsing {
  id: string
  collectTask: string
  url: string
  // html: string
  success: boolean
  error: string | null
  errorType: string | null
  createdAt: string
}

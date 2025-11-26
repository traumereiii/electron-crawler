import { Page } from 'puppeteer-core'

export enum TabStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING'
}

export enum TabTaskErrorType {
  NAVIGATION_ERROR = 'NAVIGATION_ERROR',
  TASK_ERROR = 'TASK_ERROR',
  ON_SUCCESS_ERROR = 'ON_SUCCESS_ERROR'
}

export interface TabTask {
  id: string
  label: string
  url: string

  onPageLoaded: (page: Page) => Promise<void>
  onSuccess?: (task: TabTask, result: TabTaskResult) => Promise<void>
  onError: (error: Error, type: TabTaskErrorType) => Promise<void>

  screenshot?: boolean
  retryCountOnNavigateError?: number
}

export interface TabTaskResult {
  id: string
  url: string
  success: boolean
  screenshot?: string
  startedAt: Date
  spentTimeOnNavigateInMillis: number
  spentTimeOnPageLoadedInMillis: number
}

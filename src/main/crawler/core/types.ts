import { Page } from 'puppeteer-core'

export interface Crawler {
  run(options?: CrawlerExecuteOptions): Promise<void>
}

export interface CrawlerExecuteOptions {
  headless?: boolean
  maxConcurrentTabs?: number[]
  tabTaskTimeoutInMillis?: number
  width?: number
  height?: number
  params?: Record<string, any>
}

export enum TabStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING'
}

export enum TabTaskErrorType {
  NAVIGATION_ERROR = 'NAVIGATION_ERROR',
  TASK_ERROR = 'TASK_ERROR',
  ON_SUCCESS_ERROR = 'ON_SUCCESS_ERROR'
}

export interface CapturedImage {
  url: string
  buffer: Buffer
  mimeType?: string
}

export type TabTask = {
  id: string
  sessionId: string
  parentId?: string
  label: string
  url: string
  captureImages?: boolean
  screenshot?: boolean
  retryCountOnNavigateError?: number
  onError?: TabTaskErrorHandler
}

export type AsyncTabTask = TabTask & {
  onPageLoaded?: TabTaskPageLoadedHandler
  onSuccess?: TabTaskSuccessHandler
}
export type TabTaskPageLoadedHandler = (
  page: Page,
  images: CapturedImage[],
  tabTask: TabTask
) => Promise<void>

export type TabTaskSuccessHandler = (task: TabTask, result: TabTaskResult) => Promise<void>
export type TabTaskErrorHandler = (
  error: Error,
  type: TabTaskErrorType,
  result: TabTaskResult
) => Promise<void>

export type SyncTabTask<T> = TabTask & {
  onPageLoaded: (page: Page, images: CapturedImage[], tabTask: TabTask) => Promise<T>
}

export type TabTaskResult = {
  id: string
  parentId?: string
  url: string
  success: boolean
  screenshot?: string
  html?: string
  capturedImages: CapturedImage[]
  startedAt: Date
  spentTimeOnNavigateInMillis: number
  spentTimeOnPageLoadedInMillis: number
  error?: Error
  errorType?: TabTaskErrorType
}

export type SyncTabTaskResult<T> = TabTaskResult & {
  data?: T
}

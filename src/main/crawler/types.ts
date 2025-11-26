import { Page } from 'puppeteer-core'
import { CapturedImage } from '@main/crawler/tab'

export interface Crawler {
  run(options?: CrawlerExecuteOptions): Promise<void>
}

export interface CrawlerExecuteOptions {
  headless?: boolean
  maxConcurrentTabs?: number[]
  tabTaskTimeoutInMillis?: number
  width?: number
  height?: number
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

export interface TabTask {
  id: string
  label: string
  url: string

  captureImages?: boolean
  onPageLoaded: (page: Page, images: CapturedImage[]) => Promise<void>
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

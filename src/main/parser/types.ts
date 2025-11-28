import { TabTaskErrorType } from '@main/crawler/types'

export enum ParsingErrorType {
  SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ParsingResult<T> {
  success: boolean
  url: string
  html: string
  data: T
  error?: Error
  errorType?: ParsingErrorType
}

export interface ParsingRequest {
  collectTask: string
  url: string
  html: string
  // onSuccess: (result: ParsingResult<T>) => Promise<void>
  // onError: (error: Error, type: ParsingErrorType) => Promise<void>
}

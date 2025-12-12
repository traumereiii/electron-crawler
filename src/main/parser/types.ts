export interface ParsingRequest<T> {
  sessionId: string
  taskId: string
  url: string
  html: string
  onSuccess: ParsingSuccessHandler<T>
  onFail: ParsingFailHandler<T>
}

export type ParsingSuccessHandler<T> = (
  request: ParsingRequest<T>,
  result: ParsingSuccessResult<T>
) => Promise<void>
export type ParsingFailHandler<T> = (
  request: ParsingRequest<T>,
  result: ParsingFailResult
) => Promise<void>

export enum ParsingErrorType {
  SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
  VALUE_NOT_FOUND = 'VALUE_NOT_FOUND',
  SUCCESS_HANDLER_FAIL = 'SUCCESS_HANDLER_FAIL',
  PARSING_FAIL = 'PARSING_FAIL',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export type ParsingResultInner<T> = ParsingSuccessResult<T> | ParsingFailResult

export type ParsingSuccessResult<T> = {
  success: true
  data: T
}
export type ParsingFailResult = {
  success: false
  errorType?: ParsingErrorType
  errorMessage?: string
}

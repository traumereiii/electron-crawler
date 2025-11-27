export type LogType = 'info' | 'success' | 'error'
export type Log = {
  type: LogType
  message: string
  timestamp: string
}

export type Stock = {
  code: string
  name: string
  currentPrice: number
  // 거래량
  volume: number
  // 거래대금
  tradingValue: number
  // 시가총액
  marketCap: number
  per: number
  eps: number
  pbr: number
}

export type Pagination = {
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type PaginationState = {
  currentPage: number
  pageSize: number
  totalItems: number
}

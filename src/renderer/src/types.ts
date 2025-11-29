export type Stock = {
  code: string
  name: string
  price: number
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

export type PaginationState = {
  currentPage: number
  pageSize: number
  totalItems: number
}

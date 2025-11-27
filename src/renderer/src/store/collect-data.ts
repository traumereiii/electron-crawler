import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { PaginationState, Stock } from '@renderer/types'
import { paginate } from '@renderer/lib/utils'

const initialState: { data: Stock[]; pagination: PaginationState } = {
  data: [
    {
      code: '005930',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005931',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005932',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005933',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005934',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005935',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005936',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    },
    {
      code: '005937',
      name: '삼성전자',
      currentPrice: 60000,
      volume: 15000000,
      tradingValue: 900000000000,
      marketCap: 350000000000000,
      per: 15.2,
      eps: 3947,
      pbr: 1.8
    }
  ],
  pagination: {
    currentPage: 1,
    pageSize: 3,
    totalItems: 0
  }
}

export const useCollectDataStore = create(
  immer(
    combine(initialState, (set, get) => ({
      getter: {
        currentPageItems: () => {
          // get current page data
          const { data, pagination } = get()
          return paginate<Stock>(data, pagination.currentPage, pagination.pageSize)
        }
      },
      actions: {
        addData(data: Stock) {
          set((state) => {
            state.data.push(data)
            state.pagination.totalItems = state.data.length
          })
        },
        clear() {
          set((state) => {
            state.data = []
            state.pagination.currentPage = 1
            state.pagination.totalItems = 0
          })
        },
        setPage(page: number) {
          set((state) => {
            state.pagination.currentPage = page
          })
        }
      }
    })) // end of combine
  ) // end of immer
)

export const useAddData = () => useCollectDataStore((state) => state.actions.addData)
export const useClearCollectData = () => useCollectDataStore((state) => state.actions.clear)
export const useCollectData = () => useCollectDataStore((state) => state.data)
export const useCurrentPageItems = () =>
  useCollectDataStore((state) => state.getter.currentPageItems)

import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Log } from '@renderer/types'

const initialState: { logs: Log[] } = {
  logs: [
    {
      message: '크롤링 시스템 초기화 완료',
      type: 'info',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('ko-KR')
    },
    {
      message: '✓ https://example.com/products/item-1 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 3500000).toLocaleTimeString('ko-KR')
    },
    {
      message: '✓ https://example.com/products/item-2 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 3000000).toLocaleTimeString('ko-KR')
    },
    {
      message: '✗ https://example.com/products/item-3 수집 실패 - 연결 오류',
      type: 'error',
      timestamp: new Date(Date.now() - 2400000).toLocaleTimeString('ko-KR')
    },
    {
      message: '재시도 중...',
      type: 'info',
      timestamp: new Date(Date.now() - 2300000).toLocaleTimeString('ko-KR')
    },
    {
      message: '✓ https://example.com/reviews/page-1 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString('ko-KR')
    },
    {
      message: '✓ https://example.com/reviews/page-2 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 1200000).toLocaleTimeString('ko-KR')
    },
    {
      message: '✓ https://example.com/categories/electronics 수집 성공',
      type: 'success',
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString('ko-KR')
    }
  ]
}

export const useLogStore = create(
  immer(
    combine(initialState, (set) => ({
      actions: {
        addLog(message: string, type: 'info' | 'success' | 'error') {
          const newLog: Log = {
            message,
            type,
            timestamp: new Date().toLocaleTimeString('ko-KR')
          }
          set((state) => {
            state.logs.push(newLog)
          })
        }
      }
    })) // end of combine
  ) // end of immer
)

export const useAddLog = () => useLogStore((state) => state.actions.addLog)
export const useLogs = () => useLogStore((state) => state.logs)

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CrawlerStartParams, DEFAULT_CRAWLER_PARAMS } from '@/lib/types'

interface CrawlerSettingsStore {
  settings: CrawlerStartParams
  updateSettings: (settings: Partial<CrawlerStartParams>) => void
  setPageRange: (startPage: number, endPage: number) => void
  setMaxConcurrentTabs: (level: 1 | 2 | 3, value: number) => void
  reset: () => void
}

export const useCrawlerSettingsStore = create<CrawlerSettingsStore>()(
  persist(
    immer((set) => ({
      settings: DEFAULT_CRAWLER_PARAMS,

      updateSettings: (settings: Partial<CrawlerStartParams>) => {
        set((state) => {
          state.settings = { ...state.settings, ...settings }
        })
      },

      setPageRange: (startPage: number, endPage: number) => {
        set((state) => {
          const pageNumbers: number[] = []
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
          }
          state.settings.pageNumbers = pageNumbers
        })
      },

      setMaxConcurrentTabs: (level: 1 | 2 | 3, value: number) => {
        set((state) => {
          state.settings.maxConcurrentTabs[level - 1] = value
        })
      },

      reset: () => {
        set((state) => {
          state.settings = { ...DEFAULT_CRAWLER_PARAMS }
        })
      }
    })),
    {
      name: 'crawler-settings',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// 선택자 함수
export const useCrawlerSettings = () =>
  useCrawlerSettingsStore((state) => state.settings)

export const useUpdateCrawlerSettings = () =>
  useCrawlerSettingsStore((state) => state.updateSettings)

export const useSetPageRange = () =>
  useCrawlerSettingsStore((state) => state.setPageRange)

export const useSetMaxConcurrentTabs = () =>
  useCrawlerSettingsStore((state) => state.setMaxConcurrentTabs)

export const useResetCrawlerSettings = () =>
  useCrawlerSettingsStore((state) => state.reset)

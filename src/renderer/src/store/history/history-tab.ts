import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import { HistoryTab } from '@renderer/types'

const initialState: {
  tab: HistoryTab
} = {
  tab: 'sessions'
}

export const useHistoryTabStore = create(
  immer(
    combine(initialState, (set) => ({
      actions: {
        setTab(tab: HistoryTab) {
          set((state) => {
            state.tab = tab
          })
        }
      }
    })) // end of combine
  ) // end of immer
)

export const useHistoryTab = () => {
  {
    const tab = useHistoryTabStore((state) => state.tab)
    const setTab = useHistoryTabStore((state) => state.actions.setTab)
    return {
      tab,
      setTab
    }
  }
}

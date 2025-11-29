import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const initialState: { id: string; total: number; success: number; fail: number } = {
  id: '',
  total: 0,
  success: 0,
  fail: 0
}

export const useStatStore = create(
  immer(
    combine(initialState, (set) => ({
      getter: {},
      actions: {
        addStat(stat: { id: string; success: boolean }) {
          console.log('addStat: ', stat)
          set((state) => {
            state.id = stat.id
            state.total += 1
            if (stat.success) {
              state.success += 1
            } else {
              state.fail += 1
            }
          })
        },

        clear() {
          set((state) => {
            state.id = ''
            state.total = 0
            state.success = 0
            state.fail = 0
          })
        }
      }
    })) // end of combine
  ) // end of immer
)

export const useAddStat = () => useStatStore((state) => state.actions.addStat)
export const useClearCollectStat = () => useStatStore((state) => state.actions.clear)

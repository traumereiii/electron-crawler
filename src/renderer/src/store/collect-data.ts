import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Stock } from '@renderer/types'

const initialState: { data: Stock[] } = {
  data: []
}

export const useCollectDataStore = create(
  immer(
    combine(initialState, (set) => ({
      getter: {},
      actions: {
        addData(data: Stock) {
          set((state) => {
            const find = state.data.find((it) => it.code === data.code)
            if (find) {
              state.data.splice(state.data.indexOf(find), 1, data)
            } else {
              state.data.push(data)
            }
          })
        },
        clear() {
          set((state) => {
            state.data = []
          })
        }
      }
    })) // end of combine
  ) // end of immer
)

export const useAddData = () => useCollectDataStore((state) => state.actions.addData)
export const useClearCollectData = () => useCollectDataStore((state) => state.actions.clear)
export const useCollectData = () => useCollectDataStore((state) => state.data)

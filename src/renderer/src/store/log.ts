import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Log } from '../../../types'

const MAX_LOGS = 1000

const initialState: { logs: Log[] } = {
  logs: []
}

export const useLogStore = create(
  immer(
    combine(initialState, (set, get) => ({
      actions: {
        addLog(message: Log) {
          if (!message.timestamp) {
            message.timestamp = new Date().toLocaleTimeString('ko-KR')
          }

          set((state) => {
            if (get().logs.length >= MAX_LOGS) {
              state.logs.pop()
            }
            state.logs.unshift(message)
          })
        },
        clear() {
          set((state) => {
            state.logs = []
          })
        }
      }
    })) // end of combine
  ) // end of immer
)

export const useAddLog = () => useLogStore((state) => state.actions.addLog)
export const useLogs = () => useLogStore((state) => state.logs)
export const useClearLogs = () => useLogStore((state) => state.actions.clear)

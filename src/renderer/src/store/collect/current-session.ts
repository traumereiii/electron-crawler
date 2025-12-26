import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const initialState: { sessionId: string | null } = {
  sessionId: null
}

export const useCurrentSessionStore = create(
  immer(
    combine(initialState, (set) => ({
      actions: {
        setSessionId(sessionId: string) {
          set((state) => {
            state.sessionId = sessionId
          })
        },
        clearSessionId() {
          set((state) => {
            state.sessionId = null
          })
        }
      }
    }))
  )
)

export const useCurrentSessionId = () => useCurrentSessionStore((state) => state.sessionId)
export const useSetSessionId = () => useCurrentSessionStore((state) => state.actions.setSessionId)
export const useClearSessionId = () =>
  useCurrentSessionStore((state) => state.actions.clearSessionId)

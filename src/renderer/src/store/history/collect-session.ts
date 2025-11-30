import { combine, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import type { CollectSession } from '@/types'

const initialState: {
  collectSessions: CollectSession[]
  filter: {
    period: 'all' | 'today' | 'week' | 'month'
  }
} = {
  collectSessions: [],
  filter: {
    period: 'all'
  }
}

export const useCollectSessionStore = create(
  devtools(
    immer(
      combine(initialState, (set) => ({
        actions: {
          addCollectSession(session: CollectSession) {
            set((state) => {
              state.collectSessions.push(session)
            })
          },
          clear() {
            set((state) => {
              state.collectSessions = []
              state.filter.period = 'all'
            })
          },
          setFilterPeriod(period: 'all' | 'today' | 'week' | 'month') {
            set((state) => {
              state.filter.period = period
            })
          }
        }
      })) // end of combine
    ) // end of immer
  ) // end of devtools
)
export const useCollectSessions = () => {
  const allSessions = useCollectSessionStore((state) => state.collectSessions)
  const period = useCollectSessionStore((state) => state.filter.period)
  if (period === 'all') {
    return allSessions
  }
  if (period === 'today') {
    const today = new Date()
    return allSessions.filter((session) => {
      const sessionDate = new Date(session.startedAt)
      return (
        sessionDate.getDate() === today.getDate() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()
      )
    })
  }
  if (period === 'week') {
    const today = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(today.getDate() - 7)
    return allSessions.filter((session) => {
      const sessionDate = new Date(session.startedAt)
      return sessionDate >= weekAgo && sessionDate <= today
    })
  }

  if (period === 'month') {
    const today = new Date()
    const monthAgo = new Date()
    monthAgo.setDate(today.getDate() - 30)
    return allSessions.filter((session) => {
      const sessionDate = new Date(session.startedAt)
      return sessionDate >= monthAgo && sessionDate <= today
    })
  }

  return allSessions
}
export const useClearCollectSessions = () => useCollectSessionStore((state) => state.actions.clear)
export const useAddSession = () =>
  useCollectSessionStore((state) => state.actions.addCollectSession)
export const useTodayCollectSessions = () => {
  const allSessions = useCollectSessionStore((state) => state.collectSessions)
  const today = new Date()
  return allSessions.filter((session) => {
    const sessionDate = new Date(session.startedAt)
    return (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    )
  })
}
export const useAverageSuccessRate = () => {
  const allSessions = useCollectSessionStore((state) => state.collectSessions)
  if (allSessions.length === 0) return 0
  const totalTasks = allSessions.reduce((acc, session) => acc + session.totalTasks, 0)
  const totalSuccessTasks = allSessions.reduce((acc, session) => acc + session.successTasks, 0)
  if (totalTasks === 0) return 0
  return parseFloat(((totalSuccessTasks / totalTasks) * 100).toFixed(1))
}
export const useSetCollectSessionFilterPeriod = () =>
  useCollectSessionStore((state) => state.actions.setFilterPeriod)

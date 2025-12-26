import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { IPC_KEYS } from '@/lib/constant'
import { ScheduleExecution } from '@main/generated/prisma/client'

interface ScheduleExecutionState {
  executions: ScheduleExecution[]
  loading: boolean
}

const initialState: ScheduleExecutionState = {
  executions: [],
  loading: false
}

export const useScheduleExecutionStore = create(
  immer(
    combine(initialState, (set) => ({
      actions: {
        /**
         * 스케줄 실행 이력 조회
         */
        async fetchExecutions(scheduleId: string) {
          set((state) => {
            state.loading = true
          })

          try {
            const executions = await window.$renderer.request<ScheduleExecution[]>(
              IPC_KEYS.scheduling.getExecutions,
              scheduleId
            )

            set((state) => {
              state.executions = executions
              state.loading = false
            })
          } catch (error) {
            console.error('Failed to fetch executions:', error)
            set((state) => {
              state.loading = false
            })
          }
        },

        /**
         * 실행 이력 추가 (실시간)
         */
        addExecution(execution: ScheduleExecution) {
          set((state) => {
            state.executions.unshift(execution)
          })
        },

        /**
         * 실행 이력 업데이트 (실시간)
         */
        updateExecution(execution: ScheduleExecution) {
          set((state) => {
            const index = state.executions.findIndex((e) => e.id === execution.id)
            if (index !== -1) {
              state.executions[index] = execution
            } else {
              state.executions.unshift(execution)
            }
          })
        },

        /**
         * 실행 이력 초기화
         */
        clearExecutions() {
          set((state) => {
            state.executions = []
          })
        }
      }
    }))
  )
)

// Selectors
export const useScheduleExecutions = () => useScheduleExecutionStore((state) => state.executions)
export const useScheduleExecutionLoading = () => useScheduleExecutionStore((state) => state.loading)
export const useScheduleExecutionActions = () => useScheduleExecutionStore((state) => state.actions)

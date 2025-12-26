import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { IPC_KEYS } from '@/lib/constant'
import { ScheduleFormData } from '@/lib/types'
import { CrawlerSchedule } from '@main/generated/prisma/client'

interface ScheduleState {
  schedules: CrawlerSchedule[]
  selectedScheduleId: string | null
  loading: boolean
  error: string | null
}

const initialState: ScheduleState = {
  schedules: [],
  selectedScheduleId: null,
  loading: false,
  error: null
}

export const useScheduleStore = create(
  immer(
    combine(initialState, (set, get) => ({
      actions: {
        /**
         * 전체 스케줄 조회
         */
        async fetchSchedules() {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            const schedules = await window.$renderer.request<CrawlerSchedule[]>(
              IPC_KEYS.scheduling.getAll
            )

            set((state) => {
              state.schedules = schedules
              state.loading = false
            })
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
              state.loading = false
            })
          }
        },

        /**
         * 단일 스케줄 조회
         */
        async fetchScheduleById(id: string) {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            const schedule = await window.$renderer.request<CrawlerSchedule>(
              IPC_KEYS.scheduling.getById,
              id
            )

            set((state) => {
              const index = state.schedules.findIndex((s) => s.id === id)
              if (index !== -1) {
                state.schedules[index] = schedule
              } else {
                state.schedules.push(schedule)
              }
              state.loading = false
            })

            return schedule
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
              state.loading = false
            })
            throw error
          }
        },

        /**
         * 스케줄 생성
         */
        async createSchedule(formData: ScheduleFormData) {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            const schedule = await window.$renderer.request<CrawlerSchedule>(
              IPC_KEYS.scheduling.create,
              {
                name: formData.name,
                type: formData.type,
                cronExpression: formData.cronExpression,
                time: formData.time,
                weekdays: formData.weekdays ? JSON.stringify(formData.weekdays) : undefined,
                dayOfMonth: formData.dayOfMonth,
                enabled: formData.enabled,
                crawlerParams: formData.crawlerParams,
                postActions: formData.postActions
              }
            )

            set((state) => {
              state.schedules.push(schedule)
              state.loading = false
            })

            return schedule
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
              state.loading = false
            })
            throw error
          }
        },

        /**
         * 스케줄 수정
         */
        async updateSchedule(id: string, formData: Partial<ScheduleFormData>) {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            const schedule = await window.$renderer.request<CrawlerSchedule>(
              IPC_KEYS.scheduling.update,
              id,
              {
                name: formData.name,
                type: formData.type,
                cronExpression: formData.cronExpression,
                time: formData.time,
                weekdays: formData.weekdays ? JSON.stringify(formData.weekdays) : undefined,
                dayOfMonth: formData.dayOfMonth,
                enabled: formData.enabled,
                crawlerParams: formData.crawlerParams,
                postActions: formData.postActions
              }
            )

            set((state) => {
              const index = state.schedules.findIndex((s) => s.id === id)
              if (index !== -1) {
                state.schedules[index] = schedule
              }
              state.loading = false
            })

            return schedule
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
              state.loading = false
            })
            throw error
          }
        },

        /**
         * 스케줄 삭제
         */
        async deleteSchedule(id: string) {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            await window.$renderer.request(IPC_KEYS.scheduling.delete, id)

            set((state) => {
              state.schedules = state.schedules.filter((s) => s.id !== id)
              if (state.selectedScheduleId === id) {
                state.selectedScheduleId = null
              }
              state.loading = false
            })
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
              state.loading = false
            })
            throw error
          }
        },

        /**
         * 스케줄 활성화/비활성화 토글
         */
        async toggleEnabled(id: string) {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            const schedule = await window.$renderer.request<CrawlerSchedule>(
              IPC_KEYS.scheduling.toggleEnabled,
              id
            )

            set((state) => {
              const index = state.schedules.findIndex((s) => s.id === id)
              if (index !== -1) {
                state.schedules[index] = schedule
              }
              state.loading = false
            })

            return schedule
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
              state.loading = false
            })
            throw error
          }
        },

        /**
         * 즉시 실행
         */
        async executeNow(id: string) {
          try {
            await window.$renderer.request(IPC_KEYS.scheduling.executeNow, id)
          } catch (error) {
            const err = error as Error
            set((state) => {
              state.error = err.message
            })
            throw error
          }
        },

        /**
         * 선택된 스케줄 ID 설정
         */
        setSelectedScheduleId(id: string | null) {
          set((state) => {
            state.selectedScheduleId = id
          })
        },

        /**
         * 에러 초기화
         */
        clearError() {
          set((state) => {
            state.error = null
          })
        }
      }
    }))
  )
)

// Selectors
export const useSchedules = () => useScheduleStore((state) => state.schedules)
export const useSelectedScheduleId = () => useScheduleStore((state) => state.selectedScheduleId)
export const useScheduleLoading = () => useScheduleStore((state) => state.loading)
export const useScheduleError = () => useScheduleStore((state) => state.error)
export const useScheduleActions = () => useScheduleStore((state) => state.actions)

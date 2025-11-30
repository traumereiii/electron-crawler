import { combine, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import { CollectTask } from '@/types'

const initialState: {
  collectTasks: CollectTask[]
  filter: {
    urlKeyword: string
    success: boolean | null
    errorType: string | null
  }
} = {
  collectTasks: [],
  filter: {
    urlKeyword: '',
    success: null,
    errorType: null
  }
}

export const useCollectTaskStore = create(
  devtools(
    immer(
      combine(initialState, (set) => ({
        actions: {
          addCollectTask(task: CollectTask) {
            set((state) => {
              state.collectTasks.push(task)
            })
          },
          clear() {
            set((state) => {
              state.collectTasks = []
              state.filter = {
                urlKeyword: '',
                success: null,
                errorType: null
              }
            })
          },
          setFilterUrlKeyword(keyword: string) {
            set((state) => {
              state.filter.urlKeyword = keyword
            })
          },
          setFilterSuccess(success: boolean | null) {
            set((state) => {
              state.filter.success = success
            })
          },
          setFilterErrorType(errorType: string | null) {
            set((state) => {
              state.filter.errorType = errorType
            })
          }
        }
      })) // end of combine
    ), // end of immer
    { name: 'CollectTaskStore' } // options of devtools
  ) // end of devtools
)

export const useCollectTasks = () => {
  const allTasks = useCollectTaskStore((state) => state.collectTasks)
  const { urlKeyword, success, errorType } = useCollectTaskStore((state) => state.filter)

  return allTasks.filter((task) => {
    const matchesUrlKeyword =
      urlKeyword === '' || task.url.toLowerCase().includes(urlKeyword.toLowerCase())
    const matchesSuccess = success === null || task.success === success
    const matchesErrorType = errorType === null || task.errorType === errorType
    return matchesUrlKeyword && matchesSuccess && matchesErrorType
  })
}
export const useAddCollectTask = () => useCollectTaskStore((state) => state.actions.addCollectTask)
export const useClearCollectTasks = () => useCollectTaskStore((state) => state.actions.clear)
export const useSetFilterUrlKeywordOnCollectTask = () =>
  useCollectTaskStore((state) => state.actions.setFilterUrlKeyword)
export const useSetFilterSuccessOnCollectTask = () =>
  useCollectTaskStore((state) => state.actions.setFilterSuccess)
export const useSetFilterErrorTypeOnCollectTask = () =>
  useCollectTaskStore((state) => state.actions.setFilterErrorType)

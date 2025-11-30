import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import { Parsing } from '@/types'

const initialState: {
  parsings: Parsing[]
  filter: {
    urlKeyword: string
    success: boolean | null
    errorType: string | null
  }
} = {
  parsings: [],
  filter: {
    urlKeyword: '',
    success: null,
    errorType: null
  }
}

export const useParsingStore = create(
  immer(
    combine(initialState, (set) => ({
      actions: {
        addParsing(parsing: Parsing) {
          set((state) => {
            state.parsings.push(parsing)
          })
        },
        clear() {
          set((state) => {
            state.parsings = []
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
  ) // end of immer
)

export const useParsings = () => {
  const allParsings = useParsingStore((state) => state.parsings)
  const { urlKeyword, success, errorType } = useParsingStore((state) => state.filter)

  return allParsings.filter((parsing) => {
    const matchesUrlKeyword =
      urlKeyword === '' || parsing.url.toLowerCase().includes(urlKeyword.toLowerCase())
    const matchesSuccess = success === null || parsing.success === success
    const matchesErrorType = errorType === null || parsing.errorType === errorType
    return matchesUrlKeyword && matchesSuccess && matchesErrorType
  })
}

export const useAddParsing = () => useParsingStore((state) => state.actions.addParsing)
export const useClearParsings = () => useParsingStore((state) => state.actions.clear)
export const useSetFilterUrlKeywordOnParsing = () =>
  useParsingStore((state) => state.actions.setFilterUrlKeyword)
export const useSetFilterSuccessOnParsing = () =>
  useParsingStore((state) => state.actions.setFilterSuccess)
export const useSetFilterErrorTypeOnParsing = () =>
  useParsingStore((state) => state.actions.setFilterErrorType)

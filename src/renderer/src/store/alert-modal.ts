import { combine, devtools } from 'zustand/middleware'
import { create } from 'zustand'

type OpenState = {
  isOpen: true
  title: string
  description: string
  onPositive?: () => void
  onNegative?: () => void
}

type CloseState = {
  isOpen: false
}

type State = CloseState | OpenState

const initialState = {
  isOpen: false
} as State

export const useAlertModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          set({ ...params, isOpen: true })
        },
        close: () => {
          set({ isOpen: false })
        }
      }
    })), // end of combine
    { name: 'alertModalStore' } // options of devtools
  ) // end of devtools
)

export const useOpenAlertModal = () => useAlertModalStore((store) => store.actions.open)

export const useAlertModal = () => {
  const store = useAlertModalStore()
  return store as typeof store & State
}

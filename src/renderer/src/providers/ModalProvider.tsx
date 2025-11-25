import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import AlertModal from '@renderer/components/modal/AlertModal'

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <AlertModal />
        </>,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  )
}

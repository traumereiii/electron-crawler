import { MouseEvent, useMemo, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@renderer/components/ui/pagination'
import { PaginationState } from '@renderer/types'

/**
 * 페이징 상태 타입
 */

/**
 * 커스텀 페이징 컴포넌트 Props
 */
export type CustomPaginationProps = {
  /** 전체 아이템 개수 */
  totalItems: number
  /** 페이지당 아이템 수 (기본값: 10) */
  pageSize?: number
  /** 초기 페이지 (1부터 시작, 기본값: 1) */
  defaultPage?: number
  /** 페이지 변경 시 호출되는 콜백 */
  onPageChange?: (state: PaginationState) => void
}

/**
 * 페이지 목록(숫자 & ... )을 만드는 유틸 함수
 * 예) 1 ... 4 5 6 ... 10
 */
function buildPages(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  const siblingCount = 1 // 현재 페이지 양옆에 몇 개씩 보여줄지
  const firstPage = 1
  const lastPage = totalPages

  pages.push(firstPage)

  const start = Math.max(currentPage - siblingCount, 2)
  const end = Math.min(currentPage + siblingCount, totalPages - 1)

  if (start > 2) {
    pages.push('ellipsis')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis')
  }

  pages.push(lastPage)

  return pages
}

/**
 * 실제 동작하는 Pagination 컴포넌트
 */
export default function CustomPagination({
  totalItems,
  pageSize = 10,
  defaultPage = 1,
  onPageChange
}: CustomPaginationProps) {
  const [currentPage, setCurrentPage] = useState<number>(defaultPage)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  )

  const pages = useMemo(() => buildPages(currentPage, totalPages), [currentPage, totalPages])

  const emitChange = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(safePage)

    onPageChange?.({
      currentPage: safePage,
      pageSize,
      totalItems
    })
  }

  const handleClickPage = (e: MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()
    if (page === currentPage) return
    emitChange(page)
  }

  const handlePrev = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (currentPage <= 1) return
    emitChange(currentPage - 1)
  }

  const handleNext = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (currentPage >= totalPages) return
    emitChange(currentPage + 1)
  }

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <Pagination>
      <PaginationContent>
        {/* 이전 페이지 */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrev}
            aria-disabled={isFirstPage}
            className={isFirstPage ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {/* 페이지 번호들 */}
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => handleClickPage(e, p)}
                // shadcn PaginationLink 타입에 isActive 있음
                isActive={p === currentPage}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* 다음 페이지 */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            aria-disabled={isLastPage}
            className={isLastPage ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

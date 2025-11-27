import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatNumberWithUnit(num: number): string {
  // 백만, 십억, 조 단위로 변환
  if (num >= 1_0000_0000_0000) {
    return (num / 1_0000_0000_0000).toFixed(2) + '조'
  }
  if (num >= 1_0000_0000) {
    return (num / 1_0000_0000).toFixed(2) + '억'
  }
  if (num >= 1_0000) {
    return (num / 1_0000).toFixed(2) + '만'
  }
  return num.toString()
}

// utils/paginate.ts
export function paginate<T>(items: T[], currentPage: number, pageSize: number): T[] {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  return items.slice(startIndex, endIndex)
}

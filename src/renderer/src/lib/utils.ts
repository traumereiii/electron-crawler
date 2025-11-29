import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatNumberWithKoreanUnit(num: number): string {
  if (num >= 1_0000_0000_0000) {
    return (num / 1_0000_0000_0000).toFixed(2) + '조'
  } else if (num >= 1_0000_0000) {
    return (num / 1_0000_0000).toFixed(2) + '십억'
  } else if (num >= 100_000_000) {
    return (num / 100_000_000).toFixed(2) + '억'
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + '백만'
  } else if (num >= 1_0000) {
    return (num / 1_0000).toFixed(2) + '만'
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + '천'
  }

  return formatNumber(num)
}

// utils/paginate.ts
export function paginate<T>(items: T[], currentPage: number, pageSize: number): T[] {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  return items.slice(startIndex, endIndex)
}

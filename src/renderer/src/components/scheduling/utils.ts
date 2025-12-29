import { Schedule } from './types'

/**
 * 요일 배열을 텍스트로 변환
 */
export function formatWeekdays(weekdays: number[]): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return weekdays.map((d) => days[d]).join(', ')
}

/**
 * 스케줄의 주기를 텍스트로 포맷팅
 */
export function formatPeriodText(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return `매일 ${schedule.time}`
    case 'weekly': {
      const dayNames = schedule.weekdays ? formatWeekdays(schedule.weekdays) : ''
      return `매주 ${dayNames} ${schedule.time}`
    }
    case 'monthly':
      return `매월 ${schedule.dayOfMonth}일 ${schedule.time}`
    case 'cron':
      return schedule.cronExpression || 'CRON'
    default:
      return '알 수 없음'
  }
}

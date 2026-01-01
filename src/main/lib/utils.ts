export function parseNumberWithComma(numStr: string): number {
  return parseInt(numStr.replace(/,/g, ''), 10)
}

export function koreanUnitToNumber(value: string): number {
  if (value.trim() === '') {
    return 0
  }
  if (value.trim() === '백만') {
    return 1_000_000
  } else if (value.trim() === '십억') {
    return 1_0000_0000
  } else if (value.trim() === '조') {
    return 1_0000_0000_0000
  }
  throw new Error('알수 없는 단위: ' + value)
}

export function nextBoolean() {
  return Math.random() >= 0.5
}

/**
 * 현재 시스템의 로컬 시간을 Date 객체로 반환
 * UTC 타임존 오프셋을 제거하여 로컬 시간을 UTC 기준으로 저장
 */
export function getLocalDate(): Date {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset)
}

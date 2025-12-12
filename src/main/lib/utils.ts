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

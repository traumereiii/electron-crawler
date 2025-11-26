export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// src/lib/index.ts

// 이미 있던 isBlank
String.prototype.isBlank = function (): boolean {
  return this.trim().length === 0
}

String.prototype.isNotBlank = function (): boolean {
  return !this.isBlank()
}

// Kotlin 스타일: delimiter 가 없거나 빈 문자열이면 원본 문자열 반환
String.prototype.substringBefore = function (delimiter: string): string {
  const str = String(this)

  if (delimiter === '') {
    return str
  }

  const idx = str.indexOf(delimiter)
  if (idx === -1) {
    return str
  }

  return str.substring(0, idx)
}

String.prototype.substringAfter = function (delimiter: string): string {
  const str = String(this)

  if (delimiter === '') {
    return str
  }

  const idx = str.indexOf(delimiter)
  if (idx === -1) {
    return str
  }

  return str.substring(idx + delimiter.length)
}

String.prototype.substringBeforeLast = function (delimiter: string): string {
  const str = String(this)

  if (delimiter === '') {
    return str
  }

  const idx = str.lastIndexOf(delimiter)
  if (idx === -1) {
    return str
  }

  return str.substring(0, idx)
}

String.prototype.substringAfterLast = function (delimiter: string): string {
  const str = String(this)

  if (delimiter === '') {
    return str
  }

  const idx = str.lastIndexOf(delimiter)
  if (idx === -1) {
    return str
  }

  return str.substring(idx + delimiter.length)
}

String.prototype.substringBetween = function (start: string, end: string): string | null {
  const str = String(this)

  const startIdx = str.indexOf(start)
  if (startIdx === -1) {
    return null
  }

  const from = startIdx + start.length
  const endIdx = str.indexOf(end, from)
  if (endIdx === -1) {
    return null
  }

  return str.substring(from, endIdx)
}

// ---- Array 확장 ----

Array.prototype.isEmpty = function (): boolean {
  return this.length === 0
}

Array.prototype.isNotEmpty = function (): boolean {
  return this.length > 0
}

Array.prototype.first = function <T>(this: T[]): T | undefined {
  return this.length > 0 ? this[0] : undefined
}

Array.prototype.last = function <T>(this: T[]): T | undefined {
  return this.length > 0 ? this[this.length - 1] : undefined
}

Array.prototype.groupBy = function <T, K extends PropertyKey>(
  this: T[],
  keySelector: (item: T, index: number, array: T[]) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>

  this.forEach((item, index, array) => {
    const key = keySelector(item, index, array)

    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] = []
    }

    result[key].push(item)
  })

  return result
}

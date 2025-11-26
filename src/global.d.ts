export {}

declare global {
  interface String {
    isBlank(): boolean
    isNotBlank(): boolean

    substringBefore(delimiter: string): string
    substringAfter(delimiter: string): string
    substringBeforeLast(delimiter: string): string
    substringAfterLast(delimiter: string): string

    /**
     * 문자열에서 start 와 end 사이의 첫 번째 부분 문자열을 반환.
     * 둘 중 하나라도 없으면 null 반환.
     */
    substringBetween(start: string, end: string): string | null
  }

  interface Array<T> {
    isEmpty(): boolean

    isNotEmpty(): boolean

    /** 첫 번째 요소 (없으면 undefined) */
    first(): T | undefined

    /** 마지막 요소 (없으면 undefined) */
    last(): T | undefined

    /**
     * Kotlin groupBy 비슷한 기능
     * keySelector 가 반환한 값(문자열/숫자/심볼)을 키로 해서 그룹핑
     */
    groupBy<K extends PropertyKey>(
      keySelector: (item: T, index: number, array: T[]) => K
    ): Record<K, T[]>
  }
}

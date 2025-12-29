/**
 * 크롤러 실행 설정 인터페이스
 */
export interface CrawlerStartParams {
  /** 수집할 페이지 범위 (예: [1, 2, 3, 4]) */
  pageNumbers: number[]

  /** 브라우저 해상도 - 너비 */
  width: number

  /** 브라우저 해상도 - 높이 */
  height: number

  /** Headless 모드 여부 */
  headless: boolean

  /** screenshot 사용 여부 */
  screenshot?: boolean

  /** 레벨별 동시 탭 수 [레벨1, 레벨2, 레벨3] */
  maxConcurrentTabs: [number, number, number]
}

/**
 * 크롤러 설정 기본값
 */
export const DEFAULT_CRAWLER_PARAMS: CrawlerStartParams = {
  pageNumbers: [1, 2, 3, 4],
  width: 1280,
  height: 720,
  headless: false,
  screenshot: false,
  maxConcurrentTabs: [2, 4, 5]
}

/**
 * 크롤러 설정 검증 규칙
 */
export const CRAWLER_PARAMS_VALIDATION = {
  pageNumbers: {
    min: 1,
    max: 10,
    message: '페이지는 1~10 범위에서 선택하세요'
  },
  width: {
    min: 800,
    max: 1920,
    message: '너비는 800~1920 범위여야 합니다'
  },
  height: {
    min: 600,
    max: 1080,
    message: '높이는 600~1080 범위여야 합니다'
  },
  maxConcurrentTabs: {
    level1: { min: 1, max: 5, message: '레벨1 탭은 1~5 범위여야 합니다' },
    level2: { min: 1, max: 10, message: '레벨2 탭은 1~10 범위여야 합니다' },
    level3: { min: 1, max: 20, message: '레벨3 탭은 1~20 범위여야 합니다' }
  }
}

/**
 * 스케줄 타입
 */
export type ScheduleType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON'

/**
 * 실행 상태
 */
export type ExecutionStatus = 'RUNNING' | 'COMPLETED' | 'FAILED'

/**
 * 수집 후 동작 설정
 */
export interface PostActions {
  /** 데스크탑 알림 전송 여부 */
  notification: boolean

  /** 자동 엑셀 내보내기 여부 */
  autoExport: boolean

  /** 엑셀 내보내기 시 파일 경로 (null이면 사용자가 선택) */
  exportPath: string | null
}

/**
 * 스케줄 생성/수정 폼 데이터
 */
export interface ScheduleFormData {
  /** 스케줄 이름 */
  name: string

  /** 스케줄 타입 */
  type: ScheduleType

  /** CRON 표현식 (type이 'CRON'일 때만 사용) */
  cronExpression?: string

  /** 실행 시간 (HH:mm 형식) */
  time: string

  /** 주간 요일 (type이 'WEEKLY'일 때만 사용, 0=일요일, 6=토요일) */
  weekdays?: number[]

  /** 월별 날짜 (type이 'MONTHLY'일 때만 사용, 1~31) */
  dayOfMonth?: number

  /** 활성화 여부 */
  enabled: boolean

  /** 크롤러 실행 파라미터 */
  crawlerParams: CrawlerStartParams

  /** 수집 후 동작 설정 */
  postActions: PostActions
}

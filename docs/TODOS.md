# TODO: 데이터 수집 메뉴 UI 개선

## 목표

데이터 수집 시작 전 크롤러 파라미터를 설정할 수 있는 모달 UI를 추가하여, 사용자가 다음 설정을 조정할 수 있도록 개선:

- 페이지 수 (1-10 범위)
- 브라우저 해상도 (width/height)
- Headless 모드 (true/false)
- 동시 탭 수 3단계 (레벨1, 레벨2, 레벨3)

## 현재 문제점

- 수집 시작 버튼이 파라미터 없이 호출됨 (`IndexPage.tsx:51-59`)
- 페이지 수, 탭 수가 하드코딩됨 (`naver-stock.crawler.ts:51`)
- IPC 핸들러가 파라미터를 받지 않음 (`crawler.controller.ts:10-22`)
- 사용자가 설정을 변경할 방법이 없음

## 구현 계획

### Phase 1: 타입 정의 및 기본 구조

#### 1.1 공유 타입 정의

**파일**: `src/lib/types.ts` (새 파일)

```typescript
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
```

#### 1.2 Zustand 스토어 생성

**파일**: `src/renderer/src/store/crawler-settings.ts` (새 파일)

localStorage persist를 활용한 설정 저장 스토어:

```typescript
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CrawlerStartParams, DEFAULT_CRAWLER_PARAMS } from '../../../lib/types'

interface CrawlerSettingsState {
  settings: CrawlerStartParams
}

const initialState: CrawlerSettingsState = {
  settings: DEFAULT_CRAWLER_PARAMS
}

export const useCrawlerSettingsStore = create(
  persist(
    immer(
      combine(initialState, (set) => ({
        actions: {
          updateSettings(settings: Partial<CrawlerStartParams>) {
            set((state) => {
              state.settings = { ...state.settings, ...settings }
            })
          },

          setPageRange(startPage: number, endPage: number) {
            set((state) => {
              const pageNumbers: number[] = []
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i)
              }
              state.settings.pageNumbers = pageNumbers
            })
          },

          setMaxConcurrentTabs(level: 1 | 2 | 3, value: number) {
            set((state) => {
              state.settings.maxConcurrentTabs[level - 1] = value
            })
          },

          reset() {
            set((state) => {
              state.settings = { ...DEFAULT_CRAWLER_PARAMS }
            })
          }
        }
      }))
    ),
    {
      name: 'crawler-settings',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// 선택자 함수
export const useCrawlerSettings = () =>
  useCrawlerSettingsStore((state) => state.settings)

export const useUpdateCrawlerSettings = () =>
  useCrawlerSettingsStore((state) => state.actions.updateSettings)

export const useSetPageRange = () =>
  useCrawlerSettingsStore((state) => state.actions.setPageRange)

export const useSetMaxConcurrentTabs = () =>
  useCrawlerSettingsStore((state) => state.actions.setMaxConcurrentTabs)

export const useResetCrawlerSettings = () =>
  useCrawlerSettingsStore((state) => state.actions.reset)
```

### Phase 2: UI 컴포넌트

#### 2.1 Slider 컴포넌트 확인

```bash
# Slider가 없다면 설치
npx shadcn@latest add slider
```

#### 2.2 크롤러 설정 모달

**파일**: `src/renderer/src/components/collect/CrawlerSettingsModal.tsx` (새 파일)

**주요 기능**:

- 페이지 범위 입력 (시작/종료 페이지)
- 브라우저 해상도 입력 (width/height)
- Headless 모드 스위치
- 동시 탭 수 슬라이더 (3단계)
- 유효성 검증 (toast 메시지)
- 주의사항 안내

**UI 구성**:

```
┌────────────────────────────────────────┐
│  크롤러 설정                             │
│  데이터 수집 전 크롤러 파라미터를 설정하세요 │
├────────────────────────────────────────┤
│  📚 수집 페이지 범위                     │
│    시작: [1] ~ 종료: [4]                │
│    → 총 4개 페이지 수집                  │
│                                        │
│  🖥️ 브라우저 해상도                      │
│    너비: [1280] px   높이: [720] px     │
│                                        │
│  🌐 브라우저 모드                        │
│    Headless 모드 [Toggle]               │
│                                        │
│  📊 동시 실행 탭 수                      │
│    레벨1: ━━●━━━ 2개                    │
│    레벨2: ━━━━●━━━━ 4개                 │
│    레벨3: ━━━━━●━━━━━━━━ 5개            │
│                                        │
│  ⚠️ 주의사항                            │
│    • 동시 탭 수↑ = 속도↑ but 부하↑     │
│    • Headless = 리소스↓ but 디버깅↓    │
│    • 설정은 자동 저장됨                 │
├────────────────────────────────────────┤
│              [취소]  [수집 시작]          │
└────────────────────────────────────────┘
```

**유효성 검증**:

- 페이지: 1-10 범위, 시작 ≤ 종료
- 해상도: 너비 800-1920, 높이 600-1080
- 탭 수: 레벨1 (1-5), 레벨2 (1-10), 레벨3 (1-20)

### Phase 3: Backend 수정

#### 3.1 IPC 핸들러 수정

**파일**: `src/main/controller/crawler.controller.ts`

**변경 내용**:

```typescript
// import 추가
import { CrawlerStartParams } from '@/lib/types'

// 핸들러 수정 (line 10-22)
ipcMain.handle(IPC_KEYS.crawler.start, async (_event, args) => {
  try {
    const params: CrawlerStartParams = args[0]  // ⭐ 파라미터 수신
    const crawler = nestApplication.get<NaverStockCrawler>(NaverStockCrawler)

    // CrawlerExecuteOptions로 변환
    await crawler.start({
      headless: params.headless,
      width: params.width,
      height: params.height,
      maxConcurrentTabs: params.maxConcurrentTabs,
      params: {
        pageNumbers: params.pageNumbers  // ⭐ pageNumbers 전달
      }
    })

    sendLog({ type: 'info', message: '크롤러가 시작 되었습니다.' })
    return true
  } catch (e) {
    // 에러 처리...
  }
})
```

#### 3.2 NaverStockCrawler 수정

**파일**: `src/main/crawler/naver-stock.crawler.ts`

**변경 내용** (line 45-51):

```typescript
async
run(options ? : CrawlerExecuteOptions)
{
  const sessionId = await this.createSessionHistory(this.ENTRY_URL)
  await this.initTabPools(options)

  // ⭐ params에서 pageNumbers 가져오기 (기본값 유지)
  const pageNumbers = options?.params?.pageNumbers ?? [1, 2, 3, 4]

// 나머지 코드 동일...
```

### Phase 4: Frontend 연동

#### 4.1 IndexPage 수정

**파일**: `src/renderer/src/pages/IndexPage.tsx`

**변경 사항**:

1. **import 추가**:

```typescript
import CrawlerSettingsModal from '@renderer/components/collect/CrawlerSettingsModal'
import { useCrawlerSettings } from '@renderer/store/crawler-settings'
```

2. **상태 추가**:

```typescript
const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
const crawlerSettings = useCrawlerSettings()
```

3. **핸들러 수정** (line 51-59):

```typescript
// 기존: 즉시 크롤링 시작
// 변경: 모달 열기
const handleStartCollectClick = () => {
  setIsSettingsModalOpen(true)
}

// 새 함수: 모달 확인 후 크롤링 시작
const handleStartCrawling = async () => {
  setIsCollecting(true)
  clearCollectStat()

  // ⭐ 설정을 파라미터로 전달
  const result = await window.$renderer.request<boolean>(
    IPC_KEYS.crawler.start,
    crawlerSettings
  )

  if (!result) {
    setIsCollecting(false)
  }
}
```

4. **JSX 추가** (return 마지막):

```typescript
return (
  <>
    {/* 기존 코드... */ }

{/* ⭐ 크롤러 설정 모달 */
}
<CrawlerSettingsModal
  open = { isSettingsModalOpen }
onOpenChange = { setIsSettingsModalOpen }
onConfirm = { handleStartCrawling }
/>
< />
)
```

## 구현 순서 (권장)

1. ✅ **타입 정의** - `src/lib/types.ts` 생성
2. ✅ **Zustand 스토어** - `crawler-settings.ts` 생성
3. ✅ **Slider 확인** - shadcn/ui slider 컴포넌트 설치
4. ✅ **모달 컴포넌트** - `CrawlerSettingsModal.tsx` 작성
5. ✅ **Backend 수정** - IPC 핸들러 & 크롤러 수정
6. ✅ **Frontend 연동** - IndexPage에 모달 통합
7. ✅ **테스트** - 각 설정 변경 및 저장 확인

## 파일 변경 요약

### 새로 생성할 파일 (3개)

| 파일                                                             | 목적                |
|----------------------------------------------------------------|-------------------|
| `src/lib/types.ts`                                             | 공유 타입 정의 및 검증 규칙  |
| `src/renderer/src/store/crawler-settings.ts`                   | 설정 저장 Zustand 스토어 |
| `src/renderer/src/components/collect/CrawlerSettingsModal.tsx` | 설정 모달 컴포넌트        |

### 수정할 파일 (3개)

| 파일                                          | 변경 위치                | 변경 내용                        |
|---------------------------------------------|----------------------|------------------------------|
| `src/main/controller/crawler.controller.ts` | line 10-22           | IPC 핸들러에서 파라미터 수신            |
| `src/main/crawler/naver-stock.crawler.ts`   | line 45-51           | params에서 pageNumbers 사용      |
| `src/renderer/src/pages/IndexPage.tsx`      | line 51-59, return 끝 | 모달 상태 추가, 핸들러 수정, 모달 컴포넌트 추가 |

### 확인할 파일 (1개)

| 파일                                          | 확인 사항                      |
|---------------------------------------------|----------------------------|
| `src/renderer/src/components/ui/slider.tsx` | Slider 컴포넌트 존재 여부 (없으면 설치) |

## 체크리스트

구현 완료 후 다음 사항 검증:

**UI 동작**:

- [ ] 수집 시작 버튼 클릭 시 모달이 열림
- [ ] 모달에 기본값이 표시됨
- [ ] 모달 닫기 버튼이 작동함
- [ ] 유효하지 않은 값 입력 시 toast 에러 표시

**설정 저장**:

- [ ] 설정 변경 후 확인 클릭 시 localStorage에 저장됨
- [ ] 앱 재시작 후 설정이 유지됨
- [ ] 페이지 범위 계산이 정확함 (시작~종료)

**크롤링 동작**:

- [ ] IPC로 파라미터가 정상 전달됨
- [ ] 크롤러가 설정된 페이지 수만큼 수집함
- [ ] Headless 모드가 정상 작동함
- [ ] 브라우저 해상도가 설정대로 적용됨
- [ ] 동시 탭 수가 설정대로 작동함

**에러 처리**:

- [ ] 유효성 검증 실패 시 크롤링 시작 안 됨
- [ ] IPC 통신 실패 시 상태 롤백됨
- [ ] 크롤러 시작 실패 시 로그 출력됨

## 주의사항

### 타입 안전성

- `CrawlerStartParams`를 Main-Renderer 간 공유하여 타입 불일치 방지
- IPC 채널에 제네릭 타입 적용 권장

### 호환성

- 파라미터 없으면 기본값으로 동작 (`options?.params?.pageNumbers ?? [1, 2, 3, 4]`)
- 기존 코드와 100% 호환 보장

### 성능

- localStorage persist로 앱 재시작 후에도 설정 유지
- Zustand immer로 불변성 보장
- 선택자 함수로 불필요한 리렌더링 방지

### UX

- 모달 열릴 때 이전 설정값 자동 로드
- 실시간으로 총 페이지 수 표시
- Slider로 직관적인 탭 수 조절
- 주의사항 영역으로 사용자 가이드 제공

## 추가 개선 아이디어

1. **프리셋 기능**
  - 빠른 수집 (페이지 1-2, 탭 [2,5,10])
  - 일반 수집 (페이지 1-4, 탭 [2,4,5])
  - 전체 수집 (페이지 1-10, 탭 [3,8,15])

2. **스케줄링 연동**
  - 예약 수집 시 이 설정 적용

3. **설정 프로필**
  - 여러 프로필 저장 및 전환

---

## 구현 완료 기준

✅ 모든 파일 생성/수정 완료
✅ 타입 에러 없음 (`npm run typecheck` 통과)
✅ 모달 UI가 정상 작동
✅ 설정이 localStorage에 저장됨
✅ 크롤러가 설정대로 동작
✅ 체크리스트 모두 통과

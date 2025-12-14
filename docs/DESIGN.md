# Electron Crawler UI/UX 디자인 개선 계획

## 📋 개요

**목표**: 전문적이고 현대적인 데스크톱 애플리케이션 디자인으로 개선
**우선순위**: 현대적인 느낌 (2024-2025 디자인 트렌드 적용)
**범위**: 전체 UI/UX, 사용성, 시각적 요소 개선

## 🎯 핵심 개선 방향

### 1. 디자인 시스템 구축
- Tailwind 설정 중앙화 (현재 없음)
- 일관된 디자인 토큰 체계
- 타이포그래피 스케일 정의

### 2. 현대적 UI 패턴 적용
- **Glassmorphism** (유리 형태론) - 모달, 드롭다운
- **Soft Shadows** - 부드러운 그림자 효과
- **Micro-interactions** - 호버, 클릭 애니메이션
- **Gradient Mesh** - 배경 그래디언트
- **Rounded Design** - 모든 요소 rounded-2xl 통일

### 3. 사용성 강화
- EmptyState, LoadingState 컴포넌트
- 확인 다이얼로그 표준화
- 에러 처리 개선
- 키보드 네비게이션

### 4. 페이지별 최적화
- IndexPage: 현대적 대시보드
- CollectHistoryPage: 데이터 시각화
- SchedulingPage: 타임라인 UI
- **SettingsPage: 전체 구현** (현재 스켈톤)
- AboutPage: 브랜딩 강화

---

## 🚀 단계별 구현 계획

## PHASE 1: 디자인 시스템 구축 (Foundation)

### 1.1 Tailwind 설정 파일 생성
**우선순위**: 🔴 HIGH
**소요 시간**: 1-2시간

**작업 파일**:
- `tailwind.config.ts` (신규 생성)
- `src/renderer/src/index.css` (수정)
- `src/renderer/src/styles/globals.css` (수정)

**작업 내용**:

1. **브랜드 컬러 시스템 정의**
```typescript
colors: {
  brand: {
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#a855f7', // 현재 from-purple-500
      600: '#9333ea',
    },
    pink: {
      500: '#ec4899', // 현재 to-pink-500
      600: '#db2777',
    }
  },
  status: {
    success: '#10b981',  // emerald-600
    error: '#ef4444',    // red-600
    warning: '#f59e0b',  // amber-600
    info: '#6b7280',     // gray-600
  }
}
```

2. **타이포그래피 스케일**
```typescript
fontSize: {
  'display-lg': ['3.5rem', { lineHeight: '1.2', fontWeight: '700' }],
  'display-md': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
  'heading-xl': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
  'heading-lg': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
  'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
  'heading-sm': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
}
```

3. **애니메이션 프리셋**
```typescript
animation: {
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'fade-in': 'fadeIn 0.2s ease-out',
  'scale-in': 'scaleIn 0.2s ease-out',
}
```

**검증**:
- [ ] npm run dev 실행 시 에러 없음
- [ ] 기존 색상 클래스가 정상 작동
- [ ] 새 애니메이션 클래스 사용 가능

---

### 1.2 디자인 토큰 시스템
**우선순위**: 🔴 HIGH
**소요 시간**: 1시간

**작업 파일**:
- `src/renderer/src/index.css`

**작업 내용**:

CSS 변수로 디자인 토큰 체계화:

```css
:root {
  /* Brand Gradient */
  --brand-gradient: linear-gradient(to right, #a855f7, #ec4899);

  /* Shadows - 부드러운 자연스러운 그림자 */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.08);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.08);

  /* Z-index Layers */
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-modal: 1300;
  --z-toast: 1400;
  --z-tooltip: 1500;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**검증**:
- [ ] CSS 변수가 브라우저에서 정상 로드
- [ ] 다크모드에서도 올바른 값 적용

---

## PHASE 2: 공통 컴포넌트 생성

### 2.1 EmptyState 컴포넌트
**우선순위**: 🔴 HIGH
**소요 시간**: 1-2시간

**신규 파일**:
- `src/renderer/src/components/common/EmptyState.tsx`

**구현 내용**:

```tsx
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
        {Icon && <Icon className="size-12 text-purple-500" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**사용 위치**:
- `src/renderer/src/components/collect/CollectResultTable.tsx`
- `src/renderer/src/components/history/session-tab/SessionTable.tsx`
- `src/renderer/src/components/history/task-tab/TaskTable.tsx`
- `src/renderer/src/components/history/parsing-tab/ParsingTable.tsx`

**검증**:
- [ ] 빈 데이터 상태에서 EmptyState 표시
- [ ] 액션 버튼 클릭 시 정상 작동
- [ ] 반응형 레이아웃 확인

---

### 2.2 ConfirmDialog 컴포넌트
**우선순위**: 🟡 MEDIUM
**소요 시간**: 1시간

**신규 파일**:
- `src/renderer/src/components/common/ConfirmDialog.tsx`

**구현 내용**:

shadcn/ui AlertDialog를 래핑한 재사용 가능한 확인 다이얼로그

```tsx
interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  variant = 'default'
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? '처리 중...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

**사용 위치**:
- `src/renderer/src/pages/IndexPage.tsx` (초기화 버튼)
- `src/renderer/src/pages/SchedulingPage.tsx` (스케줄 삭제)

---

### 2.3 ErrorBoundary 컴포넌트
**우선순위**: 🔴 HIGH
**소요 시간**: 1시간

**신규 파일**:
- `src/renderer/src/components/ErrorBoundary.tsx`

**구현 내용**:

React 에러 경계로 예상치 못한 에러 처리

```tsx
export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="size-8 text-red-600" />
                </div>
                <div>
                  <CardTitle>오류가 발생했습니다</CardTitle>
                  <CardDescription>예상치 못한 문제가 발생했습니다</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <code className="text-sm">{this.state.error?.message}</code>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => window.location.reload()} className="flex-1">
                  새로고침
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                  홈으로
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
```

**사용 위치**:
- `src/renderer/src/App.tsx` (최상위에서 감싸기)

---

## PHASE 3: IndexPage 현대화

### 3.1 히어로 섹션 추가
**우선순위**: 🔴 HIGH
**소요 시간**: 1시간

**수정 파일**:
- `src/renderer/src/pages/IndexPage.tsx`

**Before**:
```tsx
<PageTitle title="데이터 수집" description="네이버 증권 테마별 주가 수집" />
```

**After**:
```tsx
{/* Hero Section with Gradient */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 mb-6">
  <div className="relative z-10">
    <h1 className="text-3xl font-bold text-white mb-2">데이터 수집</h1>
    <p className="text-purple-100">네이버 증권에서 테마별 주가를 자동으로 수집합니다</p>
  </div>
  {/* Decorative Elements */}
  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
</div>
```

---

### 3.2 통계 카드 개선
**우선순위**: 🔴 HIGH
**소요 시간**: 1-2시간

**수정 파일**:
- `src/renderer/src/components/collect/StatWindow.tsx`

**개선 내용**:
- Neumorphism 요소 추가
- 프로그레스 바 추가
- 아이콘 추가
- 호버 효과 강화

```tsx
<Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-slate-600 text-base font-medium">전체 수집</CardTitle>
      <div className="p-2 bg-purple-100 rounded-lg">
        <Database className="size-4 text-purple-600" />
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
      {store.total}
    </div>
    <p className="text-slate-500 text-sm mt-1">건</p>
    {/* Progress Bar */}
    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min((store.total / 1000) * 100, 100)}%` }}
      />
    </div>
  </CardContent>
</Card>
```

---

### 3.3 실시간 상태 표시 개선
**우선순위**: 🟡 MEDIUM
**소요 시간**: 30분

**수정 파일**:
- `src/renderer/src/pages/IndexPage.tsx`

**Before**:
```tsx
{isCollecting && (
  <Card className="bg-emerald-50 border-emerald-200">
    <CardContent className="py-4">
      <div className="flex items-center gap-3">
        <div className="size-3 bg-emerald-600 rounded-full animate-pulse" />
        <span className="text-emerald-800">크롤링 진행 중...</span>
      </div>
    </CardContent>
  </Card>
)}
```

**After**:
```tsx
{isCollecting && (
  <Card className="border-0 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md animate-fade-in">
    <CardContent className="py-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="size-3 bg-emerald-600 rounded-full animate-pulse" />
          <div className="absolute inset-0 size-3 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <div>
          <span className="text-emerald-900 font-medium">크롤링 진행 중...</span>
          <p className="text-emerald-700 text-sm mt-0.5">데이터를 수집하고 있습니다</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

### 3.4 고정 높이 제거
**우선순위**: 🔴 HIGH
**소요 시간**: 30분

**수정 파일**:
- `src/renderer/src/components/collect/CollectResultTable.tsx`
- `src/renderer/src/components/collect/LogWindow.tsx`

**Before**:
```tsx
<ScrollArea className="h-[1200px]">
```

**After**:
```tsx
<ScrollArea className="h-[calc(100vh-24rem)] min-h-[400px] max-h-[800px]">
```

이렇게 하면 뷰포트 크기에 따라 동적으로 높이가 조정됩니다.

---

## PHASE 4: SettingsPage 전체 구현

### 4.1 설정 페이지 구조
**우선순위**: 🔴 HIGH
**소요 시간**: 4-6시간

**수정 파일**:
- `src/renderer/src/pages/SettingsPage.tsx` (전체 재작성)

**구현 섹션**:

1. **크롤러 설정**
   - 페이지 타임아웃 (Slider: 5초~60초)
   - 동시 탭 수 (Select: 1, 2, 5, 10, 20)
   - Headless 모드 (Switch)
   - 재시도 횟수 (Input)

2. **알림 설정**
   - 수집 완료 알림 (Switch)
   - 에러 알림 (Switch)
   - 알림 사운드 (Switch)

3. **테마 설정**
   - Light/Dark/System (3개 버튼 선택)
   - 시각적 프리뷰

4. **데이터베이스 설정**
   - DB 경로 표시
   - 데이터베이스 정리 버튼
   - 용량 표시

5. **고급 설정**
   - 로그 레벨 (Select)
   - 개발자 도구 열기 (Button)

**레이아웃**:
- 좌측: 사이드바 네비게이션 (sticky)
- 우측: 설정 컨텐츠 (스크롤 가능)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 사이드바 */}
  <Card className="lg:col-span-1 h-fit sticky top-6">
    <CardContent className="pt-6">
      <nav className="space-y-1">
        {sections.map(section => (
          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              active === section.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "hover:bg-slate-50"
            )}
          >
            <section.icon className="size-5" />
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
    </CardContent>
  </Card>

  {/* 컨텐츠 */}
  <div className="lg:col-span-2 space-y-6">
    {/* 각 설정 카드들 */}
  </div>
</div>
```

---

## PHASE 5: 마이크로 인터랙션

### 5.1 버튼 애니메이션
**우선순위**: 🟡 MEDIUM
**소요 시간**: 1시간

**수정 파일**:
- `src/renderer/src/components/ui/button.tsx`

**개선 내용**:

모든 버튼에 탄성 효과 추가:

```tsx
// 기본 버튼
className="
  transform transition-all duration-200
  hover:scale-[1.02] hover:-translate-y-0.5
  active:scale-[0.98] active:translate-y-0
  shadow-sm hover:shadow-lg active:shadow-sm
"

// 아이콘 버튼
className="
  transform transition-transform duration-200
  hover:scale-110
  active:scale-95
"
```

---

### 5.2 카드 호버 효과
**우선순위**: 🟡 MEDIUM
**소요 시간**: 1시간

**수정 파일**:
- `src/renderer/src/components/ui/card.tsx`
- 모든 Card를 사용하는 컴포넌트

**개선 내용**:

```tsx
className="
  transition-all duration-300
  hover:shadow-xl hover:-translate-y-1
  border border-gray-100 hover:border-purple-200
"
```

---

### 5.3 테이블 행 호버
**우선순위**: 🟡 MEDIUM
**소요 시간**: 30분

**수정 파일**:
- 모든 테이블 컴포넌트

**개선 내용**:

```tsx
<TableRow className="
  transition-colors duration-150
  hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50
  cursor-pointer
">
```

---

## PHASE 6: 추가 개선 사항

### 6.1 키보드 단축키
**우선순위**: 🟡 MEDIUM
**소요 시간**: 2시간

**신규 파일**:
- `src/renderer/src/hooks/useKeyboardShortcuts.ts`

**구현 단축키**:
- `Ctrl+1~5`: 탭 이동
- `Ctrl+F` 또는 `/`: 검색 포커스
- `Esc`: 모달 닫기
- `Ctrl+S`: 저장 (설정 페이지)

---

### 6.2 접근성 개선
**우선순위**: 🟡 MEDIUM
**소요 시간**: 2-3시간

**작업 내용**:
- 모든 버튼에 `aria-label` 추가
- 테이블에 `caption` 및 `aria-describedby` 추가
- 로딩 상태에 `aria-live` 추가
- 포커스 visible 스타일 강화

---

## 📂 중요 파일 목록

### 신규 생성 파일
1. `tailwind.config.ts`
2. `src/renderer/src/components/common/EmptyState.tsx`
3. `src/renderer/src/components/common/ConfirmDialog.tsx`
4. `src/renderer/src/components/ErrorBoundary.tsx`
5. `src/renderer/src/hooks/useKeyboardShortcuts.ts`

### 주요 수정 파일
1. `src/renderer/src/index.css`
2. `src/renderer/src/styles/globals.css`
3. `src/renderer/src/pages/IndexPage.tsx`
4. `src/renderer/src/pages/SettingsPage.tsx`
5. `src/renderer/src/components/collect/StatWindow.tsx`
6. `src/renderer/src/components/collect/CollectResultTable.tsx`
7. `src/renderer/src/components/collect/LogWindow.tsx`
8. `src/renderer/src/components/ui/button.tsx`
9. `src/renderer/src/components/ui/card.tsx`
10. `src/renderer/src/App.tsx`

---

## ✅ 검증 체크리스트

### Phase 1 완료 후
- [ ] tailwind.config.ts 정상 로드
- [ ] 브랜드 컬러 클래스 사용 가능
- [ ] 애니메이션 클래스 작동
- [ ] CSS 변수 정상 적용

### Phase 2 완료 후
- [ ] EmptyState 컴포넌트 정상 렌더링
- [ ] ConfirmDialog 작동
- [ ] ErrorBoundary 에러 캐치

### Phase 3 완료 후
- [ ] IndexPage 히어로 섹션 표시
- [ ] 통계 카드 호버 효과 작동
- [ ] 고정 높이 제거 후 반응형 확인
- [ ] 실시간 상태 애니메이션 작동

### Phase 4 완료 후
- [ ] SettingsPage 모든 섹션 표시
- [ ] 설정 변경 및 저장 작동
- [ ] 사이드바 네비게이션 작동
- [ ] 테마 전환 작동

### Phase 5 완료 후
- [ ] 버튼 호버/클릭 애니메이션 작동
- [ ] 카드 호버 효과 작동
- [ ] 테이블 행 호버 작동

### Phase 6 완료 후
- [ ] 키보드 단축키 작동
- [ ] 스크린 리더 호환성
- [ ] 포커스 네비게이션 작동

---

## 🎨 디자인 원칙

### 색상
- **브랜드**: Purple (#a855f7) to Pink (#ec4899) 그래디언트
- **성공**: Emerald (#10b981)
- **에러**: Red (#ef4444)
- **경고**: Amber (#f59e0b)
- **중립**: Slate (600~900)

### 타이포그래피
- **Display**: 3.5rem / 3rem (bold)
- **Heading**: 2.25rem / 1.875rem / 1.5rem / 1.25rem (semibold)
- **Body**: 1rem / 0.875rem (regular)
- **Caption**: 0.75rem (regular)

### 스페이싱
- **섹션 간격**: gap-6 (1.5rem)
- **컴포넌트 간격**: gap-4 (1rem)
- **요소 간격**: gap-2 (0.5rem)
- **패딩**: p-4, p-6, p-8

### Border Radius
- **기본**: rounded-xl (0.75rem)
- **카드**: rounded-2xl (1rem)
- **히어로**: rounded-3xl (1.5rem)
- **버튼**: rounded-xl (0.75rem)

### Shadow
- **기본**: shadow-sm
- **호버**: shadow-lg
- **강조**: shadow-xl
- **부드러운**: opacity 0.08

### Transition
- **빠름**: 150ms
- **기본**: 250ms
- **느림**: 350ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

---

## 📅 구현 일정 (예상)

### Week 1: Foundation (HIGH 우선순위)
- Day 1-2: PHASE 1 (디자인 시스템 구축)
- Day 3-4: PHASE 2 (공통 컴포넌트)
- Day 5: PHASE 3 시작 (IndexPage)

### Week 2: Core Pages (HIGH 우선순위)
- Day 1-2: PHASE 3 완료 (IndexPage 현대화)
- Day 3-5: PHASE 4 (SettingsPage 구현)

### Week 3: Polish (MEDIUM 우선순위)
- Day 1-2: PHASE 5 (마이크로 인터랙션)
- Day 3-4: PHASE 6 (추가 개선)
- Day 5: 테스트 및 버그 수정

### Week 4: Final Touches
- Day 1-2: 접근성 개선
- Day 3: 성능 최적화
- Day 4-5: QA 및 최종 검증

---

## 🚨 주의사항

1. **기존 기능 유지**: 모든 개선은 기존 기능을 유지하면서 진행
2. **점진적 적용**: 한 번에 모든 것을 바꾸지 말고 단계별로 적용
3. **테스트**: 각 Phase 완료 후 반드시 테스트
4. **백업**: 주요 변경 전 git commit 필수
5. **타입 체크**: 모든 변경 후 `npm run typecheck` 실행

---

## 📚 참고 자료

### 디자인 트렌드
- Glassmorphism (2024 트렌드)
- Neumorphism (부드러운 UI)
- Micro-interactions
- Gradient Mesh

### 기술 문서
- Tailwind CSS 4: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://radix-ui.com
- Lucide Icons: https://lucide.dev

---

## 🎯 최종 목표

"**2024-2025 현대적 디자인 트렌드를 반영한, 전문적이고 세련된 데스크톱 애플리케이션**"

- ✨ 시각적으로 매력적
- 🚀 사용하기 쉬운 UX
- 🎨 일관된 디자인 시스템
- ♿ 접근성 준수
- 🌙 다크모드 완벽 지원

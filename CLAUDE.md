# CLAUDE.md

Claude Code가 이 프로젝트를 작업할 때 참고하는 가이드 문서입니다.

## 프로젝트 개요

**electron-crawler**는 Electron, React, NestJS를 기반으로 한 데스크톱 웹 크롤링 애플리케이션입니다. Puppeteer를 사용하여 네이버 금융에서 주식 데이터를 자동으로 수집하고,
React 기반 UI를 통해 실시간 모니터링 및 관리를 제공합니다.

### 기술 스택 아키텍처

- **Main Process**: NestJS 11 + TypeScript (비즈니스 로직, 크롤링, 데이터베이스 처리)
- **Renderer Process**: React 18/19 + Vite + Zustand (UI 및 상태 관리)
- **Preload**: Main-Renderer 프로세스 간 IPC 브릿지
- **Crawler**: Puppeteer 24 + Cheerio (헤드리스 브라우저 자동화 + HTML 파싱)
- **Database**: Prisma 7 + SQLite
- **UI**: Tailwind CSS 4 + Radix UI (shadcn/ui 컴포넌트)
- **Build**: electron-vite 4 + electron-builder 25

## 개발 명령어

### 개발 모드

```bash
npm run dev # 개발 모드 시작 (HMR 활성화)
npm start # 빌드된 앱 미리보기
```

### 타입 체크 및 린팅

```bash
npm run typecheck # 모든 TypeScript 타입 검사 (node + web)
npm run typecheck:node # Main process 타입 검사만
npm run typecheck:web # Renderer process 타입 검사만
npm run lint # ESLint 실행
npm run format # Prettier로 코드 포맷팅
```

### 데이터베이스

```bash
npm run prisma:migrate # Prisma 마이그레이션 실행 + 클라이언트 생성
npx prisma studio # Prisma Studio GUI 열기
npx prisma generate # 스키마 변경 후 Prisma 클라이언트 재생성
```

**중요**: Prisma 클라이언트는 `src/main/generated/prisma`에 생성됩니다 (기본 위치 아님). 스키마 변경 후 반드시 `npx prisma generate`를 실행하세요.

### 빌드

```bash
npm run build # 타입 체크 + 프로덕션 빌드
npm run build:win # Windows 설치 프로그램 빌드 (.exe)
npm run build:mac # macOS 앱 빌드
npm run build:linux # Linux 앱 빌드
npm run build:unpack # 패키징 없이 빌드 (테스트용)
```

### 테스트

```bash
npx jest # 모든 테스트 실행
npx jest --watch # Watch 모드로 테스트 실행
npx jest path/to/test.spec.ts # 특정 테스트 파일 실행
```

Jest는 Main process 테스트를 위해 `tsconfig.node.json`을 사용하도록 설정되어 있습니다.

## 아키텍처 및 핵심 개념

### 3-프로세스 아키텍처

Electron 앱은 3개의 독립적인 프로세스로 구성됩니다:

1. **Main Process** (`src/main/`): Node.js 환경에서 NestJS 실행
  - 애플리케이션 라이프사이클, 네이티브 API, IPC 핸들러 관리
  - 크롤러 로직, 파서, 데이터베이스 작업 포함
  - 진입점: `src/main/index.ts` (Electron) → `src/main/main.ts` (NestJS 부트스트랩)

2. **Renderer Process** (`src/renderer/`): 브라우저 환경에서 React 실행
  - React + Tailwind를 사용한 UI 렌더링
  - Zustand로 UI 상태 관리
  - Node.js API에 직접 접근 불가

3. **Preload Script** (`src/preload/index.ts`): Main-Renderer 간 브릿지
  - 안전한 IPC API를 `window.$renderer`를 통해 노출
  - 제공 메서드: `sendToMain()`, `onReceive()`, `request()`, `removeListener()`

### IPC 통신 패턴

모든 IPC 채널은 `src/lib/constant.ts`의 `IPC_KEYS`에 정의되어 있습니다:

**Renderer → Main (요청/응답 패턴)**:

```typescript
// Renderer에서
const result = await window.$renderer.request(IPC_KEYS.crawler.start)
```

**Main → Renderer (푸시 이벤트)**:

```typescript
// Main 컨트롤러에서
mainWindow.webContents.send(IPC_KEYS.crawler.data, stockData)

// Renderer에서
window.$renderer.onReceive(IPC_KEYS.crawler.data, (_event, data) => {
  // 데이터 처리
})
```

### 크롤러 아키텍처 (TabPool 패턴)

크롤러는 **TabPool** 시스템을 사용하여 동시 스크래핑을 수행합니다:

- `Crawler` (추상 기본 클래스): 모든 크롤러의 템플릿
- `TabPool`: 병렬 실행을 위한 Puppeteer 페이지 풀 관리
- `Tab`: 재시도 로직을 포함한 개별 페이지 작업 래핑
- `NaverStockCrawler`: 3단계 계층적 크롤링을 사용하는 구체적 구현

**크롤링 플로우**:

1. 스텔스 플러그인으로 브라우저 초기화 (봇 탐지 방지)
2. DB에 세션 기록 생성 (`CollectSession`)
3. TabPool 초기화 (예: 레벨1용 2탭, 레벨2용 2탭, 레벨3용 20탭)
4. 탭 간 병렬로 크롤링 작업 실행
5. Cheerio로 HTML 파싱 (`NaverStockParser`)
6. Prisma를 통해 데이터베이스에 저장
7. IPC를 통해 Renderer에 실시간 업데이트 전송

### 상태 관리 (Zustand)

Zustand 저장소는 `src/renderer/src/store/`에 위치:

- `collect/collect-data.ts`: 수집된 주식 데이터
- `collect/log.ts`: 실시간 로그 (최대 1000개 항목)
- `collect/collect-stat.ts`: 성공/실패 통계
- `history/*`: 필터링 기능을 포함한 세션, 작업, 파싱 기록

저장소는 상태/액션 분리를 위한 `combine` 미들웨어와 불변성을 위한 `immer`를 사용합니다.

### 데이터베이스 스키마

주요 모델 (`prisma/schema.prisma` 참조):

- **Stock**: 최종 스크랩된 주식 데이터 (코드, 이름, 가격, 거래량, PER, EPS, PBR 등)
- **CollectSession**: 크롤링 세션 메타데이터 (상태: IN_PROGRESS, COMPLETED, TERMINATED, FAILED)
- **CollectTask**: 개별 페이지 크롤 작업 (`parentId`로 계층 구조, 스크린샷 포함)
- **Parsing**: HTML 파싱 결과

**데이터베이스 위치**:

- 개발 환경: `prisma/app.db`
- 프로덕션: 빌드 시 앱 리소스 폴더로 복사됨

## 경로 별칭

`electron.vite.config.ts`와 tsconfig 파일에서 설정:

- `@/` → `src/`
- `@main/` → `src/main/`
- `@preload/` → `src/preload/`
- `@renderer/` → `src/renderer/src/`

## 일반적인 패턴

### 새로운 크롤러 생성

1. `src/main/crawler/`에서 `Crawler` 추상 클래스 확장
2. `run(params?)` 메서드 구현
3. 병렬 실행을 위해 `TabPool` 사용
4. `this.createSessionHistory()` 호출하여 세션 생성
5. `this.saveHistory()` 호출하여 작업 결과 저장
6. `CrawlerModule`에 등록 (`src/main/crawler/crawler.module.ts`)

### 새로운 파서 생성

1. `src/main/parser/`에서 `Parser` 추상 클래스 확장
2. `parse($: CheerioAPI, request)` 메서드 구현
3. CSS 선택자를 사용하여 Cheerio에서 데이터 추출
4. `this.successHistory()` 또는 `this.failHistory()` 호출하여 파싱 결과 저장
5. `ParserModule`에 등록 (`src/main/parser/parser.module.ts`)

### IPC 엔드포인트 추가

1. `src/lib/constant.ts` IPC_KEYS에 채널 이름 추가
2. `ipcMain.handle()` 또는 `ipcMain.on()`을 사용하여 `src/main/controller/`에 핸들러 생성
3. `src/main/controller/index.ts`에 컨트롤러 등록
4. Renderer에서 `window.$renderer.request()` 또는 `window.$renderer.sendToMain()`으로 호출

### UI 컴포넌트 추가

- `src/renderer/src/components/ui/`의 shadcn/ui 컴포넌트 사용
- Tailwind CSS utility-first 접근 방식 따르기
- 아이콘: `lucide-react` 라이브러리 사용
- 폼: 검증을 위해 `react-hook-form` 사용
- 토스트: Sonner 사용 (`import { toast } from 'sonner'`)

## 프로젝트별 참고사항

### Puppeteer 설정

프로젝트는 봇 탐지를 피하기 위해 스텔스 플러그인과 함께 `puppeteer-extra`를 사용합니다:

- 헤드리스 모드는 **기본적으로 비활성화** (`headless: false`)
- 브라우저 뷰포트는 `CrawlerExecuteOptions`를 통해 설정 가능
- 네이티브 모듈 (`bufferutil`, `utf-8-validate`)은 빌드 설정에서 외부화됨

### 데이터베이스 경로 처리

`PrismaService` (`src/main/prisma.service.ts`)가 데이터베이스 경로를 자동으로 처리합니다:

- 개발 환경: 프로젝트 루트의 `prisma/app.db` 사용
- 프로덕션: 실행 파일 기준 `data/app.db` 사용

### 에러 처리

크롤링 작업을 위한 3가지 에러 타입 (`prisma/schema.prisma`에 정의):

- `NAVIGATION_ERROR`: URL 탐색 실패
- `TASK_ERROR`: 페이지 처리 중 에러
- `ON_SUCCESS_ERROR`: 성공 콜백에서 에러

에러는 Winston 로거에 기록되고 `IPC_KEYS.crawler.message`를 통해 Renderer로 전송됩니다.

### 로깅

Winston 로거는 `src/main/logger.ts`에서 설정됩니다:

- 모든 레벨에 대한 콘솔 출력
- `logs/` 디렉토리에 파일 출력
- 에러와 통합 로그를 위한 별도 파일

## 현재 개발 상태

**완료**:

- ✅ TabPool 시스템을 갖춘 코어 크롤러 엔진
- ✅ Naver 주식 데이터 크롤러 구현
- ✅ Cheerio 기반 HTML 파서
- ✅ 로그 및 통계를 포함한 실시간 모니터링 UI
- ✅ 수집 기록 뷰어 (세션, 작업, 파싱 결과)

**진행 중** (README.md TODO 섹션 참조):

- 🔄 페이지네이션 컴포넌트 및 헬퍼
- 🔄 스크린샷 미리보기 모달
- 🔄 Excel 내보내기 기능
- 🔄 수집 스케줄링 백엔드 로직
- 🔄 세션 상태 관리 개선

## 주요 파일 경로

| 구성요소               | 경로                                               |
|--------------------|--------------------------------------------------|
| **IPC 상수**         | `src/lib/constant.ts`                            |
| **Electron 진입점**   | `src/main/index.ts`                              |
| **NestJS 부트스트랩**   | `src/main/main.ts`                               |
| **App 모듈**         | `src/main/app.module.ts`                         |
| **Crawler 추상 클래스** | `src/main/crawler/core/crawler.ts`               |
| **TabPool**        | `src/main/crawler/core/tab-pool.ts`              |
| **Naver 크롤러**      | `src/main/crawler/naver-stock.crawler.ts`        |
| **Parser 추상 클래스**  | `src/main/parser/parser.ts`                      |
| **Naver 파서**       | `src/main/parser/naver-stock.parser.ts`          |
| **Preload**        | `src/preload/index.ts`                           |
| **React App**      | `src/renderer/src/App.tsx`                       |
| **IndexPage**      | `src/renderer/src/pages/IndexPage.tsx`           |
| **로그 저장소**         | `src/renderer/src/store/collect/log.ts`          |
| **수집 데이터 저장소**     | `src/renderer/src/store/collect/collect-data.ts` |
| **Prisma 스키마**     | `prisma/schema.prisma`                           |
| **빌드 설정**          | `electron.vite.config.ts`                        |

## 코딩 가이드라인

### TypeScript

- 엄격한 타입 체크 활성화
- `any` 타입 사용 지양
- 인터페이스보다 타입(type) 선호 (유니온 타입 활용)

### React 컴포넌트

- 함수형 컴포넌트 사용
- Props 타입을 명시적으로 정의
- Hooks는 컴포넌트 최상단에 배치
- 커스텀 Hook은 `use` 접두사 사용

### Zustand 상태 관리

- `combine` 미들웨어로 상태와 액션 분리
- `immer` 미들웨어로 불변성 보장
- 선택자 함수를 별도로 export하여 재사용

### NestJS 서비스

- 의존성 주입 활용
- 단일 책임 원칙 준수
- 에러는 적절한 예외 클래스로 throw

### 데이터베이스

- 복잡한 작업은 트랜잭션 사용
- 쿼리 최적화를 위해 `select`와 `include` 활용
- 마이그레이션 파일은 의미있는 이름 사용

### 커밋 메시지

- 한글로 작성
- `feat:`, `fix:`, `refactor:`, `docs:` 등의 접두사 사용
- 변경 사항을 명확하고 간결하게 설명

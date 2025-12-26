# 수집 스케줄링 기능 구현 계획

## 개요

electron-crawler에 크롤러 자동 실행을 위한 스케줄링 기능을 구현합니다.

- **현재 상태**: UI 완성 (목 데이터), 백엔드 로직 없음
- **목표**: 완전한 스케줄링 시스템 구축 (DB, 백엔드, 프론트엔드 연동)

---

## 구현 단계

### Phase 1: 기반 구축 (데이터베이스 & 타입)

**작업 파일:**

1. `prisma/schema.prisma` - 스키마 추가
2. `src/lib/types.ts` - 타입 정의
3. `src/lib/constant.ts` - IPC 키 추가

**작업 내용:**

1. Prisma 모델 추가: `CrawlerSchedule`, `ScheduleExecution`
2. Enum 추가: `ScheduleType`, `ScheduleTarget`, `ExecutionStatus`
3. `CollectSession`에 관계 추가
4. TypeScript 인터페이스 정의: `PostActions`, `ScheduleFormData`
5. IPC 키 추가: `IPC_KEYS.scheduling.*`
6. 마이그레이션 실행: `npx prisma migrate dev --name add-scheduling-models`

**Prisma 스키마 핵심:**

```prisma
model CrawlerSchedule {
  id              String   @id @default(uuid())
  name            String
  type            ScheduleType
  cronExpression  String?
  time            String
  enabled         Boolean  @default(true)
  postActions     String   // JSON
  nextRunAt       DateTime?
  executions      ScheduleExecution[]
}

model ScheduleExecution {
  id              String   @id @default(uuid())
  scheduleId      String
  sessionId       String?
  status          ExecutionStatus
  startedAt       DateTime
  endedAt         DateTime?
  schedule        CrawlerSchedule @relation(...)
  session         CollectSession? @relation(...)
}
```

---

### Phase 2: 백엔드 CRUD 서비스

**작업 파일:**

1. `src/main/scheduling/scheduling.module.ts` (신규)
2. `src/main/scheduling/schedule.service.ts` (신규)
3. `src/main/scheduling/types.ts` (신규)
4. `src/main/app.module.ts` - import 추가

**작업 내용:**

1. SchedulingModule 생성 및 AppModule에 등록
2. ScheduleService 구현:
  - `create()`: 스케줄 생성 + nextRunAt 계산
  - `update()`: 수정 + nextRunAt 재계산
  - `delete()`: 삭제
  - `findAll()`, `findById()`: 조회
  - `toggleEnabled()`: 활성화 토글
  - `calculateNextRun()`: cron-parser로 다음 실행 시간 계산

**필수 패키지 설치:**

```bash
npm install node-cron cron-parser
npm install -D @types/node-cron @types/cron-parser
```

**nextRunAt 계산 로직:**

```typescript
import parser from 'cron-parser'

calculateNextRun(schedule: CrawlerSchedule): Date {
  let cronExpression: string

  switch (schedule.type) {
    case 'DAILY':
      const [hour, minute] = schedule.time.split(':')
      cronExpression = `${minute} ${hour} * * *`
      break
    case 'WEEKLY':
      const weekdays = JSON.parse(schedule.weekdays)
      cronExpression = `${minute} ${hour} * * ${weekdays.join(',')}`
      break
    case 'MONTHLY':
      cronExpression = `${minute} ${hour} ${schedule.dayOfMonth} * *`
      break
    case 'CRON':
      cronExpression = schedule.cronExpression
      break
  }

  return parser.parseExpression(cronExpression).next().toDate()
}
```

---

### Phase 3: 스케줄 실행 엔진

**작업 파일:**

1. `src/main/scheduling/schedule-job-manager.ts` (신규)
2. `src/main/scheduling/schedule-executor.service.ts` (신규)
3. `src/main/scheduling/scheduling.module.ts` - 프로바이더 추가

**작업 내용:**

#### 3.1 ScheduleJobManager (node-cron 관리)

- `onModuleInit()`: 앱 시작 시 활성 스케줄 로드 및 Job 등록
- `registerJob()`: CRON Job 등록
- `unregisterJob()`: Job 해제
- `Map<scheduleId, ScheduledTask>`로 Job 관리
- 동시 실행 방지 로직 (Set으로 실행 중인 스케줄 추적)

**핵심 구조:**

```typescript
@Injectable()
export class ScheduleJobManager implements OnModuleInit {
  private jobs = new Map<string, cron.ScheduledTask>()
  private runningSchedules = new Set<string>()

  async onModuleInit() {
    const activeSchedules = await this.scheduleService.findAll()
    for (const s of activeSchedules.filter(x => x.enabled)) {
      await this.registerJob(s)
    }
  }

  registerJob(schedule: CrawlerSchedule) {
    const cronExpr = this.buildCronExpression(schedule)
    const task = cron.schedule(cronExpr, async () => {
      if (this.runningSchedules.has(schedule.id)) return

      this.runningSchedules.add(schedule.id)
      try {
        await this.executorService.executeScheduledCrawler(schedule)
      } finally {
        this.runningSchedules.delete(schedule.id)
      }
    })
    this.jobs.set(schedule.id, task)
  }
}
```

#### 3.2 ScheduleExecutorService (크롤러 실행)

- `executeSchedule()`: 수동 실행
- `executeScheduledCrawler()`: 크롤러 트리거 + 이력 기록
- `waitForCrawlerCompletion()`: 크롤링 완료 대기
- `scheduleRetry()`: 재시도 로직

**실행 플로우:**

1. ScheduleExecution 생성 (status: RUNNING)
2. NaverStockCrawler.start() 호출 → sessionId 반환
3. ScheduleExecution에 sessionId 기록
4. 크롤링 완료 대기 (CollectSession 상태 폴링)
5. 결과 수집 (totalTasks, successTasks, failedTasks)
6. ScheduleExecution 완료 처리 (status: COMPLETED/FAILED)
7. 수집 후 동작 실행
8. nextRunAt 갱신

---

### Phase 4: 수집 후 동작 처리

**작업 파일:**

1. `src/main/scheduling/post-action-handler.ts` (신규)
2. `src/main/scheduling/scheduling.module.ts` - 프로바이더 추가

**작업 내용:**

- `handlePostActions()`: 총괄 처리
- `sendNotification()`: Electron Notification API
- `autoExport()`: ExcelService 재사용 (CSV/JSON 추가)
- `cleanupScreenshots()`: 파일 시스템 스캔 및 삭제
- `callWebhook()`: HTTP POST 요청

**Notification 예시:**

```typescript
async sendNotification(execution: ScheduleExecution) {
  const notification = new Notification({
    title: '수집 완료',
    body: `성공: ${execution.successTasks}, 실패: ${execution.failedTasks}`
  })
  notification.show()
}
```

---

### Phase 5: IPC 컨트롤러

**작업 파일:**

1. `src/main/controller/scheduling.controller.ts` (신규)
2. `src/main/controller/index.ts` - 등록 추가

**작업 내용:**

- `registerSchedulingIpc()` 함수 작성
- CRUD IPC 핸들러 구현:
  - `scheduling.getAll`: 전체 조회
  - `scheduling.getById`: 단일 조회
  - `scheduling.create`: 생성
  - `scheduling.update`: 수정
  - `scheduling.delete`: 삭제
  - `scheduling.toggleEnabled`: 토글
  - `scheduling.executeNow`: 즉시 실행
  - `scheduling.getExecutions`: 실행 이력 조회

- 이벤트 송신 함수:
  - `sendScheduleExecutionStart()`
  - `sendScheduleExecutionComplete()`
  - `sendScheduleExecutionFailed()`

---

### Phase 6: 프론트엔드 스토어

**작업 파일:**

1. `src/renderer/src/store/scheduling/schedule.ts` (신규)
2. `src/renderer/src/store/scheduling/schedule-execution.ts` (신규)
3. `src/renderer/src/App.tsx` - 리스너 등록

**작업 내용:**

#### 6.1 schedule.ts (Zustand 스토어)

- 상태: `schedules`, `selectedScheduleId`, `loading`, `error`
- 액션:
  - `fetchSchedules()`: 전체 조회
  - `createSchedule()`: 생성
  - `updateSchedule()`: 수정
  - `deleteSchedule()`: 삭제
  - `toggleEnabled()`: 토글
  - `executeNow()`: 즉시 실행

#### 6.2 schedule-execution.ts

- 상태: `executions`, `loading`
- 액션:
  - `fetchExecutions(scheduleId)`: 이력 조회
  - `addExecution()`: 실시간 추가
  - `updateExecution()`: 실시간 업데이트

#### 6.3 IPC 리스너 설정

```typescript
// App.tsx에서 호출
export function setupScheduleExecutionListeners() {
  window.$renderer.onReceive(IPC_KEYS.scheduling.onExecutionStart,
    (_event, execution) => {
      useScheduleExecutionStore.getState().addExecution(execution)
    }
  )
  // ... Complete, Failed 리스너도 동일
}
```

---

### Phase 7: SchedulingPage UI 연결

**작업 파일:**

1. `src/renderer/src/pages/SchedulingPage.tsx` - 기존 목 데이터 제거

**작업 내용:**

1. 목 데이터 제거 (`mockSchedules`, `mockLogs`)
2. Zustand 스토어 연결:
   ```typescript
   const { schedules, fetchSchedules, createSchedule, ... } = useScheduleStore()
   const { executions, fetchExecutions } = useScheduleExecutionStore()
   ```
3. `useEffect`로 초기 로드:
   ```typescript
   useEffect(() => {
     fetchSchedules()
   }, [])

   useEffect(() => {
     if (selectedSchedule) {
       fetchExecutions(selectedSchedule)
     }
   }, [selectedSchedule])
   ```
4. 버튼 액션 연결:
  - 스케줄 생성 폼 제출 → `createSchedule(formData)`
  - 스케줄 수정 폼 제출 → `updateSchedule(id, formData)`
  - 삭제 버튼 → `deleteSchedule(id)`
  - 활성화 토글 → `toggleEnabled(id)`
  - 즉시 실행 버튼 → `executeNow(id)`

---

### Phase 8: 통합 테스트

**테스트 시나리오:**

1. **기본 CRUD**
  - 스케줄 생성 → DB 저장 확인, nextRunAt 계산 확인
  - 스케줄 수정 → nextRunAt 재계산 확인, Job 재등록 확인
  - 스케줄 삭제 → DB 삭제, Job 해제 확인

2. **실행 테스트**
  - 즉시 실행 → 크롤러 시작, ScheduleExecution 생성 확인
  - 예약 실행 → 정확한 시간에 크롤러 시작 확인
  - 실행 이력 → UI에 표시 확인

3. **후처리 테스트**
  - autoExport → Excel 파일 생성 확인
  - notification → 데스크탑 알림 수신 확인
  - screenshotCleanup → 파일 삭제 확인

4. **앱 재시작**
  - 스케줄 생성 후 앱 종료/재시작 → 스케줄 복원 확인

---

## 핵심 기술 스택

| 구성요소    | 기술                           |
|---------|------------------------------|
| 스케줄러    | node-cron                    |
| CRON 파서 | cron-parser                  |
| 데이터베이스  | Prisma + SQLite              |
| 백엔드     | NestJS                       |
| 프론트엔드   | React + Zustand              |
| IPC 통신  | Electron ipcMain/ipcRenderer |

---

## 주요 고려사항

### 1. 동시 실행 방지

- `Set<scheduleId>`로 실행 중인 스케줄 추적
- Job 실행 전 중복 체크

### 2. 앱 재시작 시 스케줄 복원

- `ScheduleJobManager.onModuleInit()` 자동 실행
- DB에서 활성 스케줄 로드 및 Job 재등록

### 3. 타임존 처리

- 현재: 시스템 로컬 타임존 사용
- 향후: 타임존 필드 추가 가능

### 4. 에러 복구

- 재시도 로직 (retryOnFailure, retryCount, retryInterval)
- 실행 이력에 에러 기록
- Notification/Webhook으로 알림

---

## 구현 순서 요약

1. **Phase 1**: Prisma 스키마 + 타입 정의 + IPC 키
2. **Phase 2**: ScheduleService (CRUD)
3. **Phase 3**: ScheduleJobManager + ScheduleExecutorService
4. **Phase 4**: PostActionHandler
5. **Phase 5**: IPC 컨트롤러
6. **Phase 6**: Zustand 스토어
7. **Phase 7**: SchedulingPage UI 연결
8. **Phase 8**: 통합 테스트

---

## 참고 파일 경로

### 신규 생성 파일

- `src/main/scheduling/scheduling.module.ts`
- `src/main/scheduling/schedule.service.ts`
- `src/main/scheduling/schedule-job-manager.ts`
- `src/main/scheduling/schedule-executor.service.ts`
- `src/main/scheduling/post-action-handler.ts`
- `src/main/scheduling/types.ts`
- `src/main/controller/scheduling.controller.ts`
- `src/renderer/src/store/scheduling/schedule.ts`
- `src/renderer/src/store/scheduling/schedule-execution.ts`

### 수정 파일

- `prisma/schema.prisma`
- `src/lib/types.ts`
- `src/lib/constant.ts`
- `src/main/app.module.ts`
- `src/main/controller/index.ts`
- `src/renderer/src/pages/SchedulingPage.tsx`
- `src/renderer/src/App.tsx`

---

## 다음 단계

이 계획을 승인하면 Phase 1부터 순차적으로 구현을 시작합니다.
각 Phase 완료 후 테스트를 거쳐 다음 단계로 진행합니다.

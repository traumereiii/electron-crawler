import { Route, Routes } from 'react-router'
import { useEffect } from 'react'
import IndexPage from '@renderer/pages/IndexPage'
import AboutPage from '@renderer/pages/AboutPage'
import SettingsPage from '@renderer/pages/SettingsPage'
import CollectHistoryPage from '@renderer/pages/CollectHistoryPage'
import ErrorReportPage from '@renderer/pages/ErrorReportPage'
import DefaultLayout from '@renderer/components/layouts/DefaultLayout'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { IPC_KEYS } from '@/lib/constant'
import { useScheduleExecutionActions } from '@renderer/store/scheduling/schedule-execution'
import { ScheduleExecution } from '@main/generated/prisma/client'
import { SchedulingListPage } from '@renderer/pages/scheduling/SchedulingListPage'
import { SchedulingFormPage } from '@renderer/pages/scheduling/SchedulingFormPage'
import { SchedulingDetailPage } from '@renderer/pages/scheduling/SchedulingDetailPage'

export default function App() {
  const { addExecution, updateExecution } = useScheduleExecutionActions()

  useEffect(() => {
    // 스케줄 실행 이벤트 리스너 등록
    window.$renderer.onReceive(
      IPC_KEYS.scheduling.onExecutionStart,
      (_event, data: { scheduleId: string }) => {
        console.log('스케줄 실행 시작:', data.scheduleId)
        // 실행 시작 시에는 UI에 표시할 데이터가 부족하므로 Complete/Failed 이벤트에서 처리
      }
    )

    window.$renderer.onReceive(
      IPC_KEYS.scheduling.onExecutionComplete,
      (_event, execution: ScheduleExecution) => {
        console.log('스케줄 실행 완료:', execution)
        updateExecution(execution)
      }
    )

    window.$renderer.onReceive(
      IPC_KEYS.scheduling.onExecutionFailed,
      (_event, execution: ScheduleExecution) => {
        console.log('스케줄 실행 실패:', execution)
        updateExecution(execution)
      }
    )
  }, [addExecution, updateExecution])

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path={'/'} element={<IndexPage />} />
          <Route path={'/collect-history'} element={<CollectHistoryPage />} />
          <Route path={'/error-report'} element={<ErrorReportPage />} />
          <Route path={'/collect-schedule'}>
            <Route index element={<SchedulingListPage />} />
            <Route path="form" element={<SchedulingFormPage />} />
            <Route path=":id" element={<SchedulingDetailPage />} />
          </Route>
          <Route path={'/settings'} element={<SettingsPage />} />
          <Route path={'/about'} element={<AboutPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

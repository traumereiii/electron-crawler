import { dialog, ipcMain } from 'electron'
import { IPC_KEYS } from '@/lib/constant'
import { Logger } from '@nestjs/common'
import { waitForNestAppReady } from '@main/main'
import { ScheduleService } from '@main/scheduling/schedule.service'
import { ScheduleExecutorService } from '@main/scheduling/schedule-executor.service'
import { ScheduleJobManager } from '@main/scheduling/schedule-job-manager'
import { mainWindow } from '@/main'
import { CreateScheduleDto, UpdateScheduleDto } from '@main/scheduling/types'
import { ScheduleExecution } from '@main/generated/prisma/client'
import { PrismaService } from '@main/prisma.service'

const logger = new Logger('scheduling.controller')

export async function registerSchedulingIpc() {
  const nestApplication = await waitForNestAppReady()
  const scheduleService = nestApplication.get<ScheduleService>(ScheduleService)
  const executorService = nestApplication.get<ScheduleExecutorService>(ScheduleExecutorService)
  const jobManager = nestApplication.get<ScheduleJobManager>(ScheduleJobManager)
  const prisma = nestApplication.get<PrismaService>(PrismaService)

  // 전체 스케줄 조회
  ipcMain.handle(IPC_KEYS.scheduling.getAll, async () => {
    try {
      return await scheduleService.findAll()
    } catch (e) {
      const error = e as Error
      logger.error(`전체 스케줄 조회 실패 [message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 단일 스케줄 조회
  ipcMain.handle(IPC_KEYS.scheduling.getById, async (_event, id: string) => {
    try {
      return await scheduleService.findById(id)
    } catch (e) {
      const error = e as Error
      logger.error(`스케줄 조회 실패 [id=${id}, message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 스케줄 생성
  ipcMain.handle(IPC_KEYS.scheduling.create, async (_event, dto: CreateScheduleDto) => {
    try {
      const schedule = await scheduleService.create(dto)

      // enabled가 true면 Job 등록
      if (schedule.enabled) {
        await jobManager.registerJob(schedule)
      }

      return schedule
    } catch (e) {
      const error = e as Error
      logger.error(`스케줄 생성 실패 [message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 스케줄 수정
  ipcMain.handle(IPC_KEYS.scheduling.update, async (_event, id: string, dto: UpdateScheduleDto) => {
    try {
      const schedule = await scheduleService.update(id, dto)

      // Job 재등록
      if (schedule.enabled) {
        await jobManager.registerJob(schedule)
      } else {
        jobManager.unregisterJob(schedule.id)
      }

      return schedule
    } catch (e) {
      const error = e as Error
      logger.error(`스케줄 수정 실패 [id=${id}, message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 스케줄 삭제
  ipcMain.handle(IPC_KEYS.scheduling.delete, async (_event, id: string) => {
    try {
      // Job 해제
      jobManager.unregisterJob(id)

      // 스케줄 삭제
      await scheduleService.delete(id)

      return { success: true }
    } catch (e) {
      const error = e as Error
      logger.error(`스케줄 삭제 실패 [id=${id}, message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 스케줄 활성화/비활성화 토글
  ipcMain.handle(IPC_KEYS.scheduling.toggleEnabled, async (_event, id: string) => {
    try {
      const schedule = await scheduleService.toggleEnabled(id)

      // Job 등록/해제
      if (schedule.enabled) {
        await jobManager.registerJob(schedule)
      } else {
        jobManager.unregisterJob(schedule.id)
      }

      return schedule
    } catch (e) {
      const error = e as Error
      logger.error(`스케줄 토글 실패 [id=${id}, message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 즉시 실행
  ipcMain.handle(IPC_KEYS.scheduling.executeNow, async (_event, id: string) => {
    try {
      const message = await executorService.executeNow(id)

      // 실행 시작 이벤트 전송
      sendScheduleExecutionStart(id)

      return { success: true, message }
    } catch (e) {
      const error = e as Error
      logger.error(`즉시 실행 실패 [id=${id}, message=${error.message}]`, error.stack)
      throw error
    }
  })

  // 스케줄 실행 이력 조회
  ipcMain.handle(IPC_KEYS.scheduling.getExecutions, async (_event, scheduleId: string) => {
    try {
      return await prisma.scheduleExecution.findMany({
        where: { scheduleId },
        orderBy: { startedAt: 'desc' },
        take: 50 // 최근 50개만
      })
    } catch (e) {
      const error = e as Error
      logger.error(
        `실행 이력 조회 실패 [scheduleId=${scheduleId}, message=${error.message}]`,
        error.stack
      )
      throw error
    }
  })

  // 폴더 선택 다이얼로그
  ipcMain.handle(IPC_KEYS.scheduling.selectFolder, async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: '엑셀 파일 저장 경로 선택'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      return result.filePaths[0]
    } catch (e) {
      const error = e as Error
      logger.error(`폴더 선택 실패 [message=${error.message}]`, error.stack)
      throw error
    }
  })
}

/**
 * 스케줄 실행 시작 이벤트
 */
export function sendScheduleExecutionStart(scheduleId: string) {
  mainWindow.webContents.send(IPC_KEYS.scheduling.onExecutionStart, { scheduleId })
}

/**
 * 스케줄 실행 완료 이벤트
 */
export function sendScheduleExecutionComplete(execution: ScheduleExecution) {
  mainWindow.webContents.send(IPC_KEYS.scheduling.onExecutionComplete, execution)
}

/**
 * 스케줄 실행 실패 이벤트
 */
export function sendScheduleExecutionFailed(execution: ScheduleExecution) {
  mainWindow.webContents.send(IPC_KEYS.scheduling.onExecutionFailed, execution)
}

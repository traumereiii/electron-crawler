import { Page } from 'puppeteer-core'
import {
  AsyncTabTask,
  CapturedImage,
  TabTaskErrorType,
  TabTaskResult
} from '@main/crawler/core/types'
import { HTTPResponse } from 'puppeteer'
import { PrismaService } from '@main/prisma.service'
import { sendLog } from '@main/controller/crawler.controller'
import { Logger } from '@nestjs/common'

const logger = new Logger('Tab')

const defineCaptureImages = (): [CapturedImage[], (response: HTTPResponse) => Promise<void>] => {
  const capturedImages: CapturedImage[] = []
  return [
    capturedImages,
    async (response: HTTPResponse) => {
      let url
      try {
        const request = response.request()
        const resourceType = request.resourceType()

        // 이미지 응답만 수집
        if (resourceType !== 'image') return
        if (!response.ok()) return

        url = response.url()
        const headers = response.headers()
        const mimeType = headers['content-type']

        const buffer = await response.buffer()

        capturedImages.push({
          url,
          buffer,
          mimeType
        })
      } catch (e) {
        // 이미지 수집 중 에러는 크롤링을 깨지 않도록 로그만
        console.error(`이미지 수집 실패 [${url}]`, e)
      }
    }
  ]
}

export class Tab {
  private prismaService: PrismaService
  private page: Page
  /** 이 탭에서 수집한 이미지 응답들 */

  constructor(prismaService: PrismaService, page: Page) {
    this.prismaService = prismaService
    this.page = page
  }

  /** 1. 비동기 **/
  async runAsync(task: AsyncTabTask): Promise<TabTaskResult> {
    const retryCountOnNavigateError = task?.retryCountOnNavigateError || 1

    const [capturedImages, capturedImageResponseHandler] = defineCaptureImages()
    if (task.captureImages) {
      // 👉 네비게이션 전에 리스너 등록
      this.page.on('response', capturedImageResponseHandler)
    }

    /** 1. 페이지 이동 **/
    const startedAt = new Date()
    let spentTimeOnNavigateInMillis = Date.now()
    for (let attempt = 0; attempt < retryCountOnNavigateError; attempt++) {
      try {
        await this.page.goto(task.url, { waitUntil: 'networkidle2' })
        spentTimeOnNavigateInMillis = Date.now() - spentTimeOnNavigateInMillis
      } catch (e) {
        const error = e as Error
        if (attempt === retryCountOnNavigateError - 1) {
          const taskResult = {
            id: task.id,
            parent: task.parentId,
            url: task.url,
            success: false,
            capturedImages: capturedImages,
            startedAt: startedAt,
            spentTimeOnNavigateInMillis: Date.now() - spentTimeOnNavigateInMillis,
            spentTimeOnPageLoadedInMillis: 0
          }
          logger.error(
            `페이지 이동 실패 [url=${taskResult.url}, message=${error.message}, stack=${error.stack}]`
          )
          this.saveHistory(task.sessionId, taskResult)

          if (task.onError) {
            task.onError(error, TabTaskErrorType.NAVIGATION_ERROR, taskResult)
          }
          if (task.captureImages) {
            this.page.off('response', capturedImageResponseHandler)
          }

          return taskResult
        }
      }
    }

    /** 2. 페이지 이동 후 작업 **/
    let screenshotBase64: string | undefined = undefined
    let spentTimeOnPageLoadedInMillis = 0
    try {
      const html = await this.page.content()
      if (task.onPageLoaded) {
        spentTimeOnPageLoadedInMillis = Date.now()
        await task.onPageLoaded(this.page, capturedImages, task)
        spentTimeOnPageLoadedInMillis = Date.now() - spentTimeOnPageLoadedInMillis
      }

      if (task.screenshot) {
        screenshotBase64 = await this.page.screenshotToBase64()
      }

      const taskResult: TabTaskResult = {
        id: task.id,
        parentId: task.parentId,
        url: task.url,
        success: true,
        startedAt: startedAt,
        screenshot: screenshotBase64,
        capturedImages: capturedImages,
        html: html,
        spentTimeOnNavigateInMillis,
        spentTimeOnPageLoadedInMillis
      }

      await this.saveHistory(task.sessionId, taskResult)

      /** 3. 작업 성공 콜백 **/
      if (task.onSuccess) {
        task.onSuccess(task, taskResult)
      }
      // ✅ 정상 종료 전에 리스너 해제
      if (task.captureImages) {
        this.page.off('response', capturedImageResponseHandler)
      }

      return taskResult
    } catch (e) {
      const error = e as Error
      // 적당히 큰 수
      if (spentTimeOnPageLoadedInMillis > 10000000) {
        spentTimeOnPageLoadedInMillis = Date.now() - spentTimeOnPageLoadedInMillis
      }
      const taskResult: TabTaskResult = {
        id: task.id,
        parentId: task.parentId,
        url: task.url,
        success: false,
        capturedImages: [],
        startedAt: startedAt,
        screenshot: screenshotBase64,
        spentTimeOnNavigateInMillis,
        spentTimeOnPageLoadedInMillis
      }

      if (task.onError) {
        task.onError(error, TabTaskErrorType.TASK_ERROR, taskResult)
      }
      if (task.captureImages) {
        this.page.off('response', capturedImageResponseHandler)
      }
      logger.error(
        `수집 작업 중 에러 발생 [url=${taskResult.url}, message=${error.message}, stack=${error.stack}]`
      )
      this.saveHistory(task.sessionId, taskResult)
      return taskResult
    }
  }

  private async saveHistory(sessionId: string, task: TabTaskResult) {
    try {
      const collectSession = await this.prismaService.collectSession.findUnique({
        where: { id: sessionId }
      })

      if (!collectSession) return

      if (collectSession.status === 'IN_PROGRESS') {
        await this.prismaService.$transaction(async (prisma) => {
          await prisma.collectSession.update({
            where: { id: sessionId },
            data: {
              totalTasks: { increment: 1 },
              successTasks: task.success ? { increment: 1 } : undefined,
              failedTasks: !task.success ? { increment: 1 } : undefined
            }
          })

          await prisma.collectTask.create({
            data: {
              id: task.id,
              sessionId: sessionId,
              parentId: task.parentId,
              url: task.url,
              success: task.success,
              screenshot: task.screenshot,
              startedAt: task.startedAt,
              spentTimeOnNavigateInMillis: task.spentTimeOnNavigateInMillis,
              spentTimeOnPageLoadedInMillis: task.spentTimeOnPageLoadedInMillis,
              error: task.error?.message,
              errorType: task.errorType
            }
          })
        })
      }
    } catch (e) {
      const error = e as Error
      logger.error(
        `수집 이력 생설 실패 [url=${task.url}, message=${error.message}, stack=${error.stack}]`
      )
      sendLog({
        type: 'error',
        message: `수집 이력 생설 실패 [url=${task.url}, message=${error.message}]`
      })
    }
  }
}

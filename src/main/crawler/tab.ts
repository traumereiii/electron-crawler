import { Page } from 'puppeteer-core'
import { CapturedImage, TabTask, TabTaskErrorType, TabTaskResult } from '@main/crawler/types'
import { HTTPResponse } from 'puppeteer'

export class Tab {
  private page: Page
  /** 이 탭에서 수집한 이미지 응답들 */

  constructor(page: Page) {
    this.page = page
  }

  async run(tabTask: TabTask): Promise<TabTaskResult> {
    const retryCountOnNavigateError = tabTask?.retryCountOnNavigateError || 1

    // 매 실행마다 초기화
    const capturedImages: CapturedImage[] = []
    /** response 이벤트 리스너: 이미지 응답 임시 저장 */
    let onResponse
    if (tabTask.captureImages) {
      onResponse = async (response: HTTPResponse) => {
        try {
          const request = response.request()
          const resourceType = request.resourceType()

          // 이미지 응답만 수집
          if (resourceType !== 'image') return
          if (!response.ok()) return

          const url = response.url()
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
          console.error('image capture error:', e)
        }
      }

      // 👉 네비게이션 전에 리스너 등록
      if (tabTask.captureImages) {
        this.page.on('response', onResponse)
      }
    }

    /** 1. 페이지 이동 **/
    const startedAt = new Date()
    let spentTimeOnNavigateInMillis = Date.now()
    for (let attempt = 0; attempt < retryCountOnNavigateError; attempt++) {
      try {
        await this.page.goto(tabTask.url, { waitUntil: 'networkidle2' })
        spentTimeOnNavigateInMillis = Date.now() - spentTimeOnNavigateInMillis
      } catch (e) {
        if (attempt === retryCountOnNavigateError - 1) {
          tabTask.onError(e as Error, TabTaskErrorType.NAVIGATION_ERROR)
          if (tabTask.captureImages) {
            this.page.off('response', onResponse)
          }

          return {
            id: tabTask.id,
            url: tabTask.url,
            success: false,
            startedAt: startedAt,
            spentTimeOnNavigateInMillis: Date.now() - spentTimeOnNavigateInMillis,
            spentTimeOnPageLoadedInMillis: 0
          }
        }
      }
    }

    /** 2. 페이지 이동 후 작업 **/
    let screenshotBase64: string | undefined = undefined
    let spentTimeOnPageLoadedInMillis = Date.now()
    try {
      await tabTask.onPageLoaded(this.page, capturedImages)
      spentTimeOnPageLoadedInMillis = Date.now() - spentTimeOnPageLoadedInMillis
      if (tabTask.screenshot) {
        screenshotBase64 = await this.page.screenshotToBase64()
      }

      const taskResult = {
        id: tabTask.id,
        url: tabTask.url,
        success: true,
        startedAt: startedAt,
        screenshot: screenshotBase64,
        spentTimeOnNavigateInMillis,
        spentTimeOnPageLoadedInMillis
      }

      /** 3. 작업 성공 콜백 **/
      if (tabTask.onSuccess) {
        try {
          tabTask.onSuccess(tabTask, taskResult)
        } catch (ignore) {
          // TODO 에러 처리
          console.error(ignore)
        }
      }
      // ✅ 정상 종료 전에 리스너 해제
      if (tabTask.captureImages) {
        this.page.off('response', onResponse)
      }

      return taskResult
    } catch (e) {
      // catch on page loaded error
      tabTask.onError(e as Error, TabTaskErrorType.TASK_ERROR)
      if (tabTask.captureImages) {
        this.page.off('response', onResponse)
      }
      return {
        id: tabTask.id,
        url: tabTask.url,
        success: false,
        startedAt: startedAt,
        screenshot: screenshotBase64,
        spentTimeOnNavigateInMillis,
        spentTimeOnPageLoadedInMillis
      }
    }
  }
}

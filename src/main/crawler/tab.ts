import { Page } from 'puppeteer-core'
import { TabTask, TabTaskErrorType, TabTaskResult } from '@main/crawler/types'

export class Tab {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async run(tabTask: TabTask): Promise<TabTaskResult> {
    const retryCountOnNavigateError = tabTask?.retryCountOnNavigateError || 1

    /** 1. 페이지 이동 **/
    const startedAt = new Date()
    let spentTimeOnNavigateInMillis = Date.now()
    for (let attempt = 0; attempt < retryCountOnNavigateError; attempt++) {
      try {
        await this.page.goto(tabTask.url, { waitUntil: 'networkidle2' })

        spentTimeOnNavigateInMillis = Date.now() - spentTimeOnNavigateInMillis
      } catch (e) {
        if (attempt === retryCountOnNavigateError - 1) {
          await tabTask.onError(e as Error, TabTaskErrorType.NAVIGATION_ERROR)
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
      await tabTask.onPageLoaded(this.page)
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

      return taskResult
    } catch (e) {
      // catch on page loaded error
      await tabTask.onError(e as Error, TabTaskErrorType.TASK_ERROR)
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

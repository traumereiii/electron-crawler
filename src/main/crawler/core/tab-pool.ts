import { Tab } from '@main/crawler/core/tab'
import type { AsyncTabTask, TabTaskResult } from '@main/crawler/core/types'
import { delay } from '@/lib'
import { Browser } from 'puppeteer'
import { PrismaService } from '@main/prisma.service'

const FETCH_TAB_INTERVAL = 10

export class TabPool {
  public readonly numberOfTabs: number
  private readonly onWaiting: Tab[] = []
  private readonly onRunning: Tab[] = []

  constructor(prismaService: PrismaService, browser: Browser, numberOfTabs: number) {
    this.numberOfTabs = numberOfTabs
    Array.from({ length: numberOfTabs }, () => {
      browser.newPage().then((page) => this.onWaiting.push(new Tab(prismaService, page)))
    })
  }

  async runAsyncMulti(tasks: Omit<AsyncTabTask, 'id'>[]): Promise<TabTaskResult[]> {
    return Promise.all(tasks.map((task) => this.runAsync(task)))
  }

  async runAsync(task: Omit<AsyncTabTask, 'id'>): Promise<TabTaskResult> {
    const tab = await this.fetchTab()
    this.onRunning.push(tab)

    /** 탭 작업 **/
    const tabTaskResult = await tab.runAsync({
      id: crypto.randomUUID(),
      ...task
    })

    this.onRunning.splice(this.onRunning.indexOf(tab), 1)
    this.onWaiting.push(tab)
    return tabTaskResult
  }

  private async fetchTab() {
    // find tab
    let tab: Tab | undefined
    while (!tab) {
      tab = this.onWaiting.pop()
      if (!tab) {
        await delay(FETCH_TAB_INTERVAL)
      }
    }
    return tab
  }

  isIdle() {
    return this.onRunning.length === 0
  }
}

import { Tab } from '@main/crawler/tab'
import type {
  AsyncTabTask,
  SyncTabTask,
  SyncTabTaskResult,
  TabTaskResult
} from '@main/crawler/types'
import { delay } from '@/lib'
import { Browser } from 'puppeteer'

const FETCH_TAB_INTERVAL = 20

export class TabPool {
  public readonly numberOfTabs: number
  private readonly onWaiting: Tab[] = []
  private readonly onRunning: Tab[] = []

  constructor(browser: Browser, numberOfTabs: number) {
    this.numberOfTabs = numberOfTabs
    Array.from({ length: numberOfTabs }, () => {
      browser.newPage().then((page) => this.onWaiting.push(new Tab(page)))
    })
  }

  async runSyncMulti<T>(tasks: SyncTabTask<T>[]): Promise<SyncTabTaskResult<T>[]> {
    return await Promise.all(tasks.map((task) => this.runSync(task)))
  }

  async runSync<T>(task: SyncTabTask<T>): Promise<SyncTabTaskResult<T>> {
    const tab = await this.fetchTab()
    this.onRunning.push(tab)
    const tabTaskResult = await tab.runSync<T>(task)
    this.onRunning.splice(this.onRunning.indexOf(tab), 1)
    this.onWaiting.push(tab)
    return tabTaskResult
  }

  async runAsyncMulti(tasks: AsyncTabTask[]): Promise<TabTaskResult[]> {
    return await Promise.all(tasks.map((task) => this.runAsync(task)))
  }

  async runAsync(task: AsyncTabTask): Promise<TabTaskResult> {
    const tab = await this.fetchTab()
    this.onRunning.push(tab)
    const tabTaskResult = await tab.runAsync(task)
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
}

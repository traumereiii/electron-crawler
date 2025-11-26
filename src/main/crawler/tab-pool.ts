import { Tab } from '@main/crawler/tab'
import { TabTask, TabTaskResult } from '@main/crawler/types'
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

  async runMulti(tasks: TabTask[]): Promise<TabTaskResult[]> {
    console.log(`numberOfTabs: ${this.numberOfTabs}, tasks.length: ${tasks.length}`)
    return await Promise.all(tasks.map((task) => this.run(task)))
  }

  async run(task: TabTask): Promise<TabTaskResult> {
    const tab = await this.fetchTab()
    this.onRunning.push(tab)
    const tabTaskResult = await tab.run(task)
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

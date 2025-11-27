import { Page, ElementHandle } from 'puppeteer-core'

declare module 'puppeteer-core' {
  interface ElementHandle {
    href(selector?: string): Promise<string>
    textContent(selector?: string): Promise<string>
    number(selector?: string): Promise<number>
    innerHTML(): Promise<string>
    outerHTML(): Promise<string>
  }

  interface Page {
    waitAndClick(selector: string, timeoutMs?: number): Promise<void>
    $$href(selector: string): Promise<string[]>
    innerHTML(selector: string): Promise<string>
    outerHTML(selector: string): Promise<string>
    textContent(selector: string): Promise<string>
    screenshotToBase64(): Promise<string>
    scrollToBottom(): Promise<void>
  }
}

export function extendElementHandle(handle: ElementHandle) {
  handle.href = async function (this: ElementHandle, selector?: string): Promise<string> {
    if (selector) {
      return await this.$eval(selector, (el) => (el as HTMLElement).getAttribute('href') ?? '')
    }
    return await this.evaluate((el) => (el as HTMLElement).getAttribute('href') ?? '')
  }

  handle.textContent = async function (this: ElementHandle, selector?: string): Promise<string> {
    if (selector) {
      return await this.$eval(selector, (el) => el.textContent?.trim() ?? '')
    }
    return await this.evaluate((el) => el.textContent?.trim() ?? '')
  }

  handle.number = async function (this: ElementHandle, selector?: string): Promise<number> {
    const text = await this.textContent(selector)
    return parseFloat(text.replace(/[^\d-.]/g, ''))
  }

  handle.innerHTML = async function (this: ElementHandle): Promise<string> {
    return await this.evaluate((el) => (el as HTMLElement).innerHTML)
  }

  handle.outerHTML = async function (this: ElementHandle): Promise<string> {
    return await this.evaluate((el) => (el as HTMLElement).outerHTML)
  }
}

export function extendPage(page: Page) {
  page.$$href = async function (this: Page, selector: string): Promise<string[]> {
    return await this.$$eval(selector, (elements) =>
      elements.map((el) => (el as HTMLElement).getAttribute('href') || '')
    )
  }

  page.innerHTML = async function (this: Page, selector: string): Promise<string> {
    return await this.$eval(selector, (el) => (el as HTMLElement).innerHTML)
  }

  page.outerHTML = async function (this: Page, selector: string): Promise<string> {
    return await this.$eval(selector, (el) => (el as HTMLElement).outerHTML)
  }

  page.textContent = async function (this: Page, selector: string): Promise<string> {
    return await this.$eval(selector, (el) => el.textContent ?? '')
  }

  page.screenshotToBase64 = async function (this: Page): Promise<string> {
    const screenshot = await this.screenshot({ fullPage: true, encoding: 'base64' })
    return `data:image/png;base64,${screenshot}`
  }

  page.scrollToBottom = async function (this: Page): Promise<void> {
    await this.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
  }

  page.waitAndClick = async function (
    this: Page,
    selector: string,
    timeoutMs = 30000
  ): Promise<void> {
    await this.waitForSelector(selector, { timeout: timeoutMs })
    await this.click(selector)
  }
}

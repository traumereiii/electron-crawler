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

ElementHandle.prototype.href = async function (selector?: string): Promise<string> {
  if (selector) {
    return await this.$eval(selector, (element) => element.textContent?.trim())
  } else {
    return await this.evaluate((element) => {
      return element.textContent?.trim()
    })
  }
}

ElementHandle.prototype.textContent = async function (selector?: string): Promise<string> {
  if (selector) {
    return await this.$eval(selector, (element) => element.textContent?.trim())
  } else {
    return await this.evaluate((element) => {
      return element.textContent?.trim()
    })
  }
}

ElementHandle.prototype.number = async function (selector?: string): Promise<number> {
  const text = await this.textContent(selector)
  // replace all except number and '-'
  return parseFloat(text.replace(/[^\d-.]/g, ''))
}

ElementHandle.prototype.innerHTML = async function (): Promise<string> {
  return await this.evaluate((element) => element.innerHTML)
}

ElementHandle.prototype.outerHTML = async function (): Promise<string> {
  return await this.evaluate((element) => element.outerHTML)
}

Page.prototype.$$href = async function (selector: string) {
  return await this.$$eval(selector, (elements) => {
    return elements.map((element) => element.getAttribute('href') || '')
  })
}

Page.prototype.innerHTML = async function (selector: string): Promise<string> {
  return this.$eval(selector, (element) => element.innerHTML)
}

Page.prototype.outerHTML = async function (selector: string): Promise<string> {
  return this.$eval(selector, (element) => element.outerHTML)
}

Page.prototype.textContent = async function (selector: string): Promise<string> {
  return this.$eval(selector, (element) => element.textContent || '')
}

Page.prototype.screenshotToBase64 = async function (): Promise<string> {
  const screenshot = await this.screenshot({ fullPage: true, encoding: 'base64' })
  return `data:image/png;base64,${screenshot}` // Base64 Data URL 반환
}

Page.prototype.scrollToBottom = async function (): Promise<void> {
  return this.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })
}

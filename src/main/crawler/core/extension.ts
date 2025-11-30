import { Page, ElementHandle } from 'puppeteer-core'
import { JSHandle } from 'puppeteer'
import type { CheerioAPI } from 'cheerio'
import { load } from 'cheerio'

declare module 'puppeteer-core' {
  interface ElementHandle {
    href(selector?: string): Promise<string>
    textContent(selector?: string): Promise<string>
    number(selector?: string): Promise<number>
    innerHTML(): Promise<string>
    outerHTML(): Promise<string>
    parent(): Promise<ElementHandle | null>
    siblings(selector?: string): Promise<ElementHandle[]>
    child(selector?: string): Promise<ElementHandle | null>
  }

  interface Page {
    waitAndClick(selector: string, timeoutMs?: number): Promise<void>
    $$href(selector: string): Promise<string[]>
    innerHTML(selector: string): Promise<string>
    outerHTML(selector: string): Promise<string>
    textContent(selector: string): Promise<string>
    screenshotToBase64(): Promise<string>
    scrollToBottom(): Promise<void>
    toCheerio(): Promise<CheerioAPI>
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

  /**
   * parent()
   * - 현재 ElementHandle의 부모 요소를 반환
   * - 부모가 없으면 null
   */
  handle.parent = async function (this: ElementHandle): Promise<ElementHandle | null> {
    const parentHandle = await this.evaluateHandle((el) => el.parentElement)
    // parentElement가 없으면 JSHandle<null> 이라서 처리 필요
    const props = await parentHandle.getProperties()
    const iter = props.values().next()
    // puppeteer가 element를 바로 ElementHandle로 래핑해주지 않고
    // object wrapper를 줄 수도 있으므로 방어적으로 처리
    const value = iter.value as unknown

    if (!value) {
      await parentHandle.dispose()
      return null
    }

    // 대부분의 경우 parentElement 자체가 바로 반환되므로 캐스팅
    return value as ElementHandle
  }

  /**
   * siblings(selector?)
   * - 현재 요소의 형제 요소들을 반환 (자기 자신 제외)
   * - selector가 있으면 matches(selector) 인 것만 필터
   */

  handle.siblings = async function (
    this: ElementHandle,
    selector?: string
  ): Promise<ElementHandle[]> {
    // 브라우저 콘텍스트에서:
    // 1) 부모 요소 찾고
    // 2) 부모의 children 중에서 자기 자신(el)을 제외
    // 3) selector 있으면 matches(selector)로 필터링
    const arrayHandle = await this.evaluateHandle((el, sel) => {
      const parent = el.parentElement
      if (!parent) return []

      const children = Array.from(parent.children)
      let siblings = children.filter((child) => child !== el)

      if (sel) {
        siblings = siblings.filter((child) => (child as Element).matches(sel as string))
      }

      return siblings
    }, selector ?? null)

    const properties = await arrayHandle.getProperties()
    const result: ElementHandle[] = []

    for (const property of properties.values()) {
      // JSHandle -> ElementHandle로 캐스팅
      const elHandle = (property as JSHandle).asElement?.()
      if (elHandle) {
        result.push(elHandle as ElementHandle)
      }
    }

    await arrayHandle.dispose()

    return result
  }

  /**
   * child(selector?)
   * - selector 있으면: 현재 요소 기준으로 querySelector(selector)와 동일 (첫 번째 매치)
   * - selector 없으면: 첫 번째 자식 요소 (firstElementChild)
   */
  handle.child = async function (
    this: ElementHandle,
    selector?: string
  ): Promise<ElementHandle | null> {
    if (selector) {
      // 현재 요소 기준 querySelector
      const found = await this.$(selector)
      return found ?? null
    }

    // selector가 없으면 첫 번째 자식 요소
    const childHandle = await this.evaluateHandle((el) => el.firstElementChild)
    const props = await childHandle.getProperties()
    const iter = props.values().next()
    const value = iter.value as unknown

    if (!value) {
      await childHandle.dispose()
      return null
    }

    return value as ElementHandle
  }
}

export async function extendPage(page: Page) {
  const proto = Object.getPrototypeOf(page)

  const elementHandle = await page.$('body')
  const prototypeOfElementHandle = Object.getPrototypeOf(elementHandle)
  extendElementHandle(prototypeOfElementHandle)

  proto.$$href = async function (this: Page, selector: string): Promise<string[]> {
    return await this.$$eval(selector, (elements) =>
      elements.map((el) => (el as HTMLElement).getAttribute('href') || '')
    )
  }

  proto.innerHTML = async function (this: Page, selector: string): Promise<string> {
    return await this.$eval(selector, (el) => (el as HTMLElement).innerHTML)
  }

  proto.outerHTML = async function (this: Page, selector: string): Promise<string> {
    return await this.$eval(selector, (el) => (el as HTMLElement).outerHTML)
  }

  proto.textContent = async function (this: Page, selector: string): Promise<string> {
    return await this.$eval(selector, (el) => el.textContent ?? '')
  }

  proto.screenshotToBase64 = async function (this: Page): Promise<string> {
    const screenshot = await this.screenshot({ fullPage: true, encoding: 'base64' })
    return `data:image/png;base64,${screenshot}`
  }

  proto.scrollToBottom = async function (this: Page): Promise<void> {
    await this.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
  }

  proto.waitAndClick = async function (
    this: Page,
    selector: string,
    timeoutMs = 30000
  ): Promise<void> {
    await this.waitForSelector(selector, { timeout: timeoutMs })
    await this.click(selector)
  }

  proto.toCheerio = async function (this: Page) {
    const body = await this.outerHTML('body')
    return load(body)
  }
}

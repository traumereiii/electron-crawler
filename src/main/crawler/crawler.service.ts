import puppeteer from 'puppeteer-extra'
import { delay } from '../../lib'
//const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
import { Page } from 'puppeteer-core'
import { writeFileSync } from 'fs'

puppeteer.use(StealthPlugin())

// // 1) 타입 보강 (모듈 보강)
declare module 'puppeteer-core' {
  interface Page {
    waitAndClick(selector: string, timeoutMs?: number): Promise<void>
    test(): void
  }
}

// 2) 실제 prototype 메서드 구현
Page.prototype.waitAndClick = async function (
  this: Page,
  selector: string,
  timeoutMs: number = 10_000
): Promise<void> {
  await this.waitForSelector(selector, { timeout: timeoutMs })
  await this.click(selector)
}

Page.prototype.test = async function () {
  console.log('test')
}

export class CrawlerService {
  async run() {
    console.log('start')
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page: Page = await browser.newPage()

    console.log('running page')

    await page.goto('https://finance.naver.com/sise/theme.naver')

    const urls = await page.$$href('table.type_1 td.col_type1 a')
    console.log(urls)

    const screenshot = await page.screenshotToBase64()
    console.log(screenshot)
    writeFileSync('screenshot.txt', screenshot)

    const base64 = screenshot.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    writeFileSync('screenshot.png', buffer)
  }
}

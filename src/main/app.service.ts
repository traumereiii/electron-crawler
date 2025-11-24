import { Injectable } from '@nestjs/common'
import puppeteer from 'puppeteer'

@Injectable()
export class AppService {
  async getHello(): Promise<void> {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto('https://www.naver.com')
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { UsersService } from './user.service'

@Injectable()
export class AppService {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  async getHello(): Promise<void> {
    await this.usersService.createUser({
      email: 'sds901234@naver.com'
    })

    // const browser = await puppeteer.launch({ headless: false })
    // const page = await browser.newPage()
    // await page.goto('https://www.naver.com')
  }
}

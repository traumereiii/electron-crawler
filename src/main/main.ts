import 'reflect-metadata'
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { INestApplication, Logger } from '@nestjs/common'
import { createNestLogger } from './logger'
import { setNestApp } from '@main/nest-app'

export async function bootstrap(): Promise<INestApplication> {
  const logger = createNestLogger()

  const app = await NestFactory.create(AppModule, { logger })
  // app.useGlobalInterceptors(new ErrorLoggingInterceptor())
  await app.init() // 선택이지만 안전하게
  setNestApp(app)
  return app
}
const logger = new Logger('System')
export let nestApplication: INestApplication
;(async () => {
  logger.log('NestJS 초기화 시작')
  nestApplication = await bootstrap()
  logger.log('NestJS 초기화 완료')
})()

export const waitForNestAppReady = async (): Promise<INestApplication> => {
  while (!nestApplication) {
    logger.log('NestJS 초기화 대기중...')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  logger.log('NestJS 준비 완료')
  return nestApplication
}

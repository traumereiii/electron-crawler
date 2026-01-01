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
export let bootstrapError: Error | null = null
;(async () => {
  try {
    logger.log('NestJS 초기화 시작')
    nestApplication = await bootstrap()
    logger.log('NestJS 초기화 완료')
  } catch (error) {
    logger.error('NestJS 초기화 실패', error instanceof Error ? error.stack : error)
    bootstrapError = error instanceof Error ? error : new Error(String(error))
    throw error
  }
})()

export const waitForNestAppReady = async (): Promise<INestApplication> => {
  let waitTime = 0
  const maxWaitTime = 30000 // 최대 30초 대기

  while (!nestApplication && !bootstrapError) {
    if (waitTime >= maxWaitTime) {
      throw new Error('NestJS 초기화 타임아웃 (30초)')
    }
    logger.log('NestJS 초기화 대기중...')
    await new Promise((resolve) => setTimeout(resolve, 100))
    waitTime += 100
  }

  if (bootstrapError) {
    throw new Error(`NestJS 초기화 실패: ${bootstrapError.message}`)
  }

  logger.log('NestJS 준비 완료')
  return nestApplication
}

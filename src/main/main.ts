import 'reflect-metadata'
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { INestApplication } from '@nestjs/common'
import { createNestLogger } from './logger'
import { ErrorLoggingInterceptor } from './interceptors/error.interceptor'

export async function bootstrap(): Promise<INestApplication> {
  const logger = createNestLogger()

  const app = await NestFactory.create(AppModule, { logger })
  // app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(new ErrorLoggingInterceptor())
  await app.init() // 선택이지만 안전하게
  return app
}

export let nestApplication: INestApplication
;(async () => {
  nestApplication = await bootstrap()
})()

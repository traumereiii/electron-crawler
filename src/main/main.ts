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
  console.log('Starting NestJS application...')
  nestApplication = await bootstrap()
  console.log('NestJS application started.')
})()

export const waitForNestAppReady = async (): Promise<INestApplication> => {
  while (!nestApplication) {
    console.log('Waiting for NestJS application to be ready...')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  console.log('NestJS application is ready.')
  return nestApplication
}

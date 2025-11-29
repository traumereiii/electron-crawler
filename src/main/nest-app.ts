// src/main/nest-app.ts
import type { INestApplication } from '@nestjs/common'

let resolveReady: ((app: INestApplication) => void) | null = null

const nestAppReady = new Promise<INestApplication>((resolve) => {
  resolveReady = resolve
})

export function setNestApp(app: INestApplication) {
  resolveReady?.(app)
}

export function waitForNestAppReady(): Promise<INestApplication> {
  return nestAppReady
}

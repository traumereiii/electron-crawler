import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export function createNestLogger() {
  const isPackaged = app.isPackaged

  // 로그 파일 위치: 너가 원한대로 exe 옆 logs 폴더
  // (권한 문제 대비해서 필요하면 userData로 바꿔도 됨)
  const exeDir = path.dirname(process.execPath)
  const logDir = path.join(exeDir, 'logs')

  if (isPackaged && !fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const transports: winston.transport[] = []

  if (!isPackaged) {
    // ✅ dev: 콘솔 로깅
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(
            ({ level, message, timestamp, context }) =>
              `${timestamp} [${level}]${context ? ' [' + context + ']' : ''} ${message}`
          )
        )
      })
    )
  } else {
    // ✅ packaged: 파일 로깅
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'app.log'),
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      })
    )

    // (선택) 에러 로그 따로
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json())
      })
    )
  }

  return WinstonModule.createLogger({
    transports
  })
}

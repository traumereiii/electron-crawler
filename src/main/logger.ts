import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export function createNestLogger() {
  const isPackaged = app.isPackaged

  // 로그 파일 위치 설정
  let logDir: string
  if (isPackaged) {
    // 프로덕션: exe 파일 옆 logs 폴더
    const exeDir = path.dirname(process.execPath)
    logDir = path.join(exeDir, 'logs')
  } else {
    // 개발: 프로젝트 루트의 logs 폴더
    logDir = path.join(process.cwd(), 'logs')
  }

  // logs 디렉토리가 없으면 생성
  if (!fs.existsSync(logDir)) {
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

    // ✅ dev: 파일 로깅 추가
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'app.log'),
        level: 'debug',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      })
    )

    // dev: 에러 로그 따로
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 3
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

    // packaged: 에러 로그 따로
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 3
      })
    )
  }

  return WinstonModule.createLogger({
    transports
  })
}

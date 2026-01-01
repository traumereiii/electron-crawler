import { Injectable, Logger } from '@nestjs/common'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './generated/prisma/client'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const logger = new Logger(PrismaService.name)

    try {
      let url
      if (app.isPackaged) {
        // 패키징 후: exe가 있는 폴더
        const exeDir = path.dirname(process.execPath)
        const dbDir = path.join(exeDir, 'data')
        logger.log(`패키징 모드: exeDir=${exeDir}, dbDir=${dbDir}`)

        fs.mkdirSync(dbDir, { recursive: true })
        const targetDb = path.join(dbDir, 'app.db')
        url = `file:${targetDb}`

        if (!fs.existsSync(targetDb)) {
          const templateDb = path.join(process.resourcesPath, 'app.db')
          logger.log(`템플릿 DB 복사: ${templateDb} -> ${targetDb}`)

          if (!fs.existsSync(templateDb)) {
            throw new Error(`템플릿 데이터베이스 파일을 찾을 수 없습니다: ${templateDb}`)
          }

          fs.copyFileSync(templateDb, targetDb)
          logger.log('데이터베이스 파일 복사 완료')
        }
      } else {
        // 개발 중: 프로젝트 루트(혹은 너가 원하는 dev 경로)
        url = process.env.DATABASE_URL
        logger.log(`개발 모드: DATABASE_URL=${url}`)
      }

      const adapter = new PrismaBetterSqlite3({ url })
      super({ adapter })
      logger.log(`SQLite 연결 성공: ${url}`)
    } catch (error) {
      logger.error('PrismaService 초기화 실패', error instanceof Error ? error.stack : error)
      throw error
    }
  }
}

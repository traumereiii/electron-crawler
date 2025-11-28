import { Injectable, Logger } from '@nestjs/common'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './generated/prisma/client'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

@Injectable({
  providedIn: 'root'
})
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    try {
      let url
      if (app.isPackaged) {
        // 패키징 후: exe가 있는 폴더
        const exeDir = path.dirname(process.execPath)
        const dbDir = path.join(exeDir, 'data')
        fs.mkdirSync(dbDir, { recursive: true })
        const targetDb = path.join(dbDir, 'app.db')
        url = `file:${targetDb}`
        if (!fs.existsSync(targetDb)) {
          const templateDb = path.join(process.resourcesPath, 'app.db')
          fs.copyFileSync(templateDb, targetDb)
        }
      } else {
        // 개발 중: 프로젝트 루트(혹은 너가 원하는 dev 경로)
        url = process.env.DATABASE_URL
      }
      const adapter = new PrismaBetterSqlite3({ url })
      super({ adapter })
      this.logger.log(`URL for SQLite: ${url}`)
    } catch (e) {
      console.error(e)
    }
  }
}

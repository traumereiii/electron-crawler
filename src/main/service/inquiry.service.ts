import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import JSZip from 'jszip'
import { app } from 'electron'

const logger = new Logger('InquiryService')

@Injectable()
export class InquiryService {
  /**
   * 로그 폴더의 파일들을 압축하여 프로젝트 루트에 저장
   */
  async exportLogs(): Promise<string> {
    try {
      // 로그 폴더 경로 결정
      const isDev = !app.isPackaged
      const logsDir = isDev
        ? path.join(process.cwd(), 'logs')
        : path.join(path.dirname(app.getPath('exe')), 'logs')

      logger.log(`로그 폴더 경로: ${logsDir}`)

      // 로그 폴더 존재 확인
      try {
        await fs.access(logsDir)
      } catch (error) {
        throw new Error('로그 폴더가 존재하지 않습니다')
      }

      // 로그 파일 목록 가져오기
      const files = await fs.readdir(logsDir)
      const logFiles = files.filter((file) => file.endsWith('.log'))

      if (logFiles.length === 0) {
        throw new Error('압축할 로그 파일이 없습니다')
      }

      logger.log(`발견된 로그 파일: ${logFiles.join(', ')}`)

      // JSZip 인스턴스 생성
      const zip = new JSZip()

      // 각 로그 파일을 zip에 추가
      for (const file of logFiles) {
        const filePath = path.join(logsDir, file)
        const content = await fs.readFile(filePath)
        zip.file(file, content)
      }

      // zip 파일 생성
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

      // 저장 경로 결정 (프로젝트 루트)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const zipFileName = `logs-${timestamp}.zip`
      const zipFilePath = isDev
        ? path.join(process.cwd(), zipFileName)
        : path.join(path.dirname(app.getPath('exe')), zipFileName)

      // zip 파일 저장
      await fs.writeFile(zipFilePath, zipBuffer)

      logger.log(`로그 파일 압축 완료: ${zipFilePath}`)

      return zipFilePath
    } catch (error) {
      const err = error as Error
      logger.error(`로그 파일 압축 실패: ${err.message}`, err.stack)
      throw error
    }
  }
}

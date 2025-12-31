import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'

const logger = new Logger('SettingsService')

export enum SettingKey {
  USE_ALERT_ON_FINISH = 'USE_ALERT_ON_FINISH',
  USE_ALERT_ON_ERROR = 'USE_ALERT_ON_ERROR',
  SCHEDULED_CRAWLER_TAB_1 = 'SCHEDULED_CRAWLER_TAB_1',
  SCHEDULED_CRAWLER_TAB_2 = 'SCHEDULED_CRAWLER_TAB_2',
  SCHEDULED_CRAWLER_TAB_3 = 'SCHEDULED_CRAWLER_TAB_3',
  SCHEDULED_CRAWLER_HEADLESS = 'SCHEDULED_CRAWLER_HEADLESS',
  SCHEDULED_CRAWLER_SCREENSHOT = 'SCHEDULED_CRAWLER_SCREENSHOT'
}

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  /**
   * 모듈 초기화 시 설정 초기값 생성
   */
  async onModuleInit() {
    await this.initializeSettings()
  }

  /**
   * 설정 초기값 생성
   */
  private async initializeSettings(): Promise<void> {
    try {
      // USE_ALERT_ON_FINISH 초기값 설정
      const finishSetting = await this.prismaService.setting.findUnique({
        where: { key: SettingKey.USE_ALERT_ON_FINISH }
      })

      if (!finishSetting) {
        await this.prismaService.setting.create({
          data: {
            key: SettingKey.USE_ALERT_ON_FINISH,
            value: 'Y'
          }
        })
        logger.log('[설정] USE_ALERT_ON_FINISH 초기값 생성 완료 (Y)')
      }

      // USE_ALERT_ON_ERROR 초기값 설정
      const errorSetting = await this.prismaService.setting.findUnique({
        where: { key: SettingKey.USE_ALERT_ON_ERROR }
      })

      if (!errorSetting) {
        await this.prismaService.setting.create({
          data: {
            key: SettingKey.USE_ALERT_ON_ERROR,
            value: 'Y'
          }
        })
        logger.log('[설정] USE_ALERT_ON_ERROR 초기값 생성 완료 (Y)')
      }
    } catch (error) {
      const err = error as Error
      logger.error(`[설정] 초기값 생성 실패: ${err.message}`, err.stack)
    }
  }

  /**
   * 설정 값 조회
   */
  async getSetting(key: SettingKey): Promise<string> {
    const setting = await this.prismaService.setting.findUnique({
      where: { key }
    })

    return setting?.value || 'N'
  }

  /**
   * 모든 설정 조회
   */
  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.prismaService.setting.findMany()

    const result: Record<string, string> = {}
    settings.forEach((setting) => {
      result[setting.key] = setting.value
    })

    return result
  }

  /**
   * 설정 값 저장
   */
  async setSetting(key: SettingKey, value: string): Promise<void> {
    await this.prismaService.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    logger.log(`[설정] ${key} = ${value}`)
  }

  /**
   * 여러 설정 값 일괄 저장
   */
  async setSettings(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.setSetting(key as SettingKey, value)
    }
  }
}

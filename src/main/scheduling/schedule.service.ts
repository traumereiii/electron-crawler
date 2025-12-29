import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { CrawlerSchedule } from '@main/generated/prisma/client'
import { CreateScheduleDto, UpdateScheduleDto } from './types'
import { CronExpressionParser } from 'cron-parser'

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name)

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * 모든 스케줄 조회
   */
  async findAll(): Promise<CrawlerSchedule[]> {
    return this.prisma.crawlerSchedule.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * ID로 스케줄 조회
   */
  async findById(id: string): Promise<CrawlerSchedule> {
    const schedule = await this.prisma.crawlerSchedule.findUnique({
      where: { id }
    })

    if (!schedule) {
      throw new NotFoundException(`스케줄을 찾을 수 없습니다. (ID: ${id})`)
    }

    return schedule
  }

  /**
   * 스케줄 생성
   */
  async create(dto: CreateScheduleDto): Promise<CrawlerSchedule> {
    const nextRunAt = this.calculateNextRun(dto)

    const schedule = await this.prisma.crawlerSchedule.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        cronExpression: dto.cronExpression,
        time: dto.time,
        weekdays: dto.weekdays,
        dayOfMonth: dto.dayOfMonth,
        enabled: dto.enabled,
        postActions: JSON.stringify(dto.postActions),
        nextRunAt
      }
    })

    this.logger.log(`스케줄 생성 완료 [id=${schedule.id}, name=${schedule.name}]`)
    return schedule
  }

  /**
   * 스케줄 수정
   */
  async update(id: string, dto: UpdateScheduleDto): Promise<CrawlerSchedule> {
    const existing = await this.findById(id)

    // 스케줄 타입이나 시간이 변경되면 nextRunAt 재계산
    const shouldRecalculate =
      dto.type !== undefined ||
      dto.cronExpression !== undefined ||
      dto.time !== undefined ||
      dto.weekdays !== undefined ||
      dto.dayOfMonth !== undefined

    let nextRunAt = existing.nextRunAt
    if (shouldRecalculate) {
      const merged = { ...existing, ...dto }
      nextRunAt = this.calculateNextRun({
        type: merged.type,
        cronExpression: merged.cronExpression || undefined,
        time: merged.time,
        weekdays: merged.weekdays || undefined,
        dayOfMonth: merged.dayOfMonth || undefined
      } as CreateScheduleDto)
    }

    const schedule = await this.prisma.crawlerSchedule.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        cronExpression: dto.cronExpression,
        time: dto.time,
        weekdays: dto.weekdays,
        dayOfMonth: dto.dayOfMonth,
        enabled: dto.enabled,
        postActions: dto.postActions ? JSON.stringify(dto.postActions) : undefined,
        nextRunAt
      }
    })

    this.logger.log(`스케줄 수정 완료 [id=${schedule.id}, name=${schedule.name}]`)
    return schedule
  }

  /**
   * 스케줄 삭제
   */
  async delete(id: string): Promise<void> {
    await this.findById(id) // 존재 확인
    await this.prisma.crawlerSchedule.delete({
      where: { id }
    })
    this.logger.log(`스케줄 삭제 완료 [id=${id}]`)
  }

  /**
   * 스케줄 활성화/비활성화 토글
   */
  async toggleEnabled(id: string): Promise<CrawlerSchedule> {
    const schedule = await this.findById(id)
    const updated = await this.prisma.crawlerSchedule.update({
      where: { id },
      data: {
        enabled: !schedule.enabled
      }
    })
    this.logger.log(`스케줄 토글 완료 [id=${id}, enabled=${updated.enabled}]`)
    return updated
  }

  /**
   * 다음 실행 시간 계산
   */
  calculateNextRun(
    schedule: Pick<
      CreateScheduleDto,
      'type' | 'time' | 'cronExpression' | 'weekdays' | 'dayOfMonth'
    >
  ): Date {
    try {
      let cronExpression: string

      switch (schedule.type) {
        case 'DAILY': {
          const [hour, minute] = schedule.time.split(':')
          cronExpression = `${minute} ${hour} * * *`
          break
        }
        case 'WEEKLY': {
          const [hour, minute] = schedule.time.split(':')
          const weekdays = schedule.weekdays ? JSON.parse(schedule.weekdays) : []
          cronExpression = `${minute} ${hour} * * ${weekdays.join(',')}`
          break
        }
        case 'MONTHLY': {
          const [hour, minute] = schedule.time.split(':')
          cronExpression = `${minute} ${hour} ${schedule.dayOfMonth} * *`
          break
        }
        case 'CRON': {
          cronExpression = schedule.cronExpression!
          break
        }
        default:
          throw new Error(`알 수 없는 스케줄 타입: ${schedule.type}`)
      }

      const interval = CronExpressionParser.parse(cronExpression)
      return interval.next().toDate()
    } catch (error) {
      const err = error as Error
      this.logger.error(`다음 실행 시간 계산 실패: ${err.message}`, err.stack)
      throw new Error(`CRON 표현식이 유효하지 않습니다: ${err.message}`)
    }
  }

  /**
   * 스케줄의 다음 실행 시간 업데이트
   */
  async updateNextRun(id: string): Promise<void> {
    const schedule = await this.findById(id)
    const nextRunAt = this.calculateNextRun(schedule)

    await this.prisma.crawlerSchedule.update({
      where: { id },
      data: { nextRunAt }
    })

    this.logger.log(`다음 실행 시간 업데이트 완료 [id=${id}, nextRunAt=${nextRunAt.toISOString()}]`)
  }
}

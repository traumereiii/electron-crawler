import { NotFoundException } from '@nestjs/common'
import { ScheduleService } from './schedule.service'
import { CreateScheduleDto, UpdateScheduleDto } from './types'

// Prisma 모듈 Mock
jest.mock('@main/generated/prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
  CrawlerSchedule: {},
  Prisma: {}
}))

// PrismaService Mock
jest.mock('@main/prisma.service')

// CrawlerSchedule 타입 정의
type CrawlerSchedule = {
  id: string
  name: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON'
  cronExpression: string | null
  time: string
  weekdays: string | null
  dayOfMonth: number | null
  enabled: boolean
  postActions: string
  nextRunAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// PrismaService 타입 정의
type PrismaService = {
  crawlerSchedule: {
    findMany: jest.Mock
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
}

describe('ScheduleService', () => {
  let service: ScheduleService
  let prisma: jest.Mocked<PrismaService>

  // 테스트용 Mock 데이터
  const mockSchedule: CrawlerSchedule = {
    id: 'test-id-1',
    name: '테스트 스케줄',
    type: 'DAILY',
    cronExpression: null,
    time: '09:00',
    weekdays: null,
    dayOfMonth: null,
    enabled: true,
    postActions: '{"notification":true}',
    nextRunAt: new Date('2025-12-29T09:00:00'),
    createdAt: new Date('2025-12-28T00:00:00'),
    updatedAt: new Date('2025-12-28T00:00:00')
  }

  beforeEach(() => {
    // PrismaService Mock 생성
    prisma = {
      crawlerSchedule: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    } as any

    service = new ScheduleService(prisma)
  })

  describe('findAll', () => {
    it('모든 스케줄을 생성일 역순으로 조회해야 한다', async () => {
      const mockSchedules = [mockSchedule, { ...mockSchedule, id: 'test-id-2' }]
      prisma.crawlerSchedule.findMany.mockResolvedValue(mockSchedules)

      const result = await service.findAll()

      expect(result).toEqual(mockSchedules)
      expect(prisma.crawlerSchedule.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc'
        }
      })
    })
  })

  describe('findById', () => {
    it('존재하는 ID로 스케줄을 조회해야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)

      const result = await service.findById('test-id-1')

      expect(result).toEqual(mockSchedule)
      expect(prisma.crawlerSchedule.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-1' }
      })
    })

    it('존재하지 않는 ID로 NotFoundException을 발생시켜야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(null)

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException)
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        '스케줄을 찾을 수 없습니다. (ID: non-existent-id)'
      )
    })
  })

  describe('create', () => {
    it('DAILY 타입 스케줄을 생성해야 한다', async () => {
      const createDto: CreateScheduleDto = {
        name: 'Daily 스케줄',
        type: 'DAILY',
        cronExpression: null,
        time: '14:30',
        weekdays: null,
        dayOfMonth: null,
        enabled: true,
        crawlerParams: {} as any,
        postActions: { notification: true, autoExport: false, exportPath: null }
      }

      prisma.crawlerSchedule.create.mockResolvedValue(mockSchedule)

      const result = await service.create(createDto)

      expect(result).toEqual(mockSchedule)
      expect(prisma.crawlerSchedule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Daily 스케줄',
            type: 'DAILY',
            time: '14:30',
            postActions: '{"notification":true}',
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('WEEKLY 타입 스케줄을 생성해야 한다', async () => {
      const createDto: CreateScheduleDto = {
        name: 'Weekly 스케줄',
        type: 'WEEKLY',
        cronExpression: null,
        time: '10:00',
        weekdays: '[1,3,5]', // 월, 수, 금
        dayOfMonth: null,
        enabled: true,
        crawlerParams: {} as any,
        postActions: { notification: false, autoExport: false, exportPath: null }
      }

      prisma.crawlerSchedule.create.mockResolvedValue({
        ...mockSchedule,
        type: 'WEEKLY',
        weekdays: '[1,3,5]'
      })

      const result = await service.create(createDto)

      expect(result.type).toBe('WEEKLY')
      expect(prisma.crawlerSchedule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'WEEKLY',
            weekdays: '[1,3,5]',
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('MONTHLY 타입 스케줄을 생성해야 한다', async () => {
      const createDto: CreateScheduleDto = {
        name: 'Monthly 스케줄',
        type: 'MONTHLY',
        cronExpression: null,
        time: '08:00',
        weekdays: null,
        dayOfMonth: 15,
        enabled: true,
        crawlerParams: {} as any,
        postActions: { notification: true, autoExport: false, exportPath: null }
      }

      prisma.crawlerSchedule.create.mockResolvedValue({
        ...mockSchedule,
        type: 'MONTHLY',
        dayOfMonth: 15
      })

      const result = await service.create(createDto)

      expect(result.type).toBe('MONTHLY')
      expect(prisma.crawlerSchedule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'MONTHLY',
            dayOfMonth: 15,
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('CRON 타입 스케줄을 생성해야 한다', async () => {
      const createDto: CreateScheduleDto = {
        name: 'CRON 스케줄',
        type: 'CRON',
        cronExpression: '0 0 * * *', // 매일 자정
        time: '00:00',
        weekdays: null,
        dayOfMonth: null,
        enabled: true,
        crawlerParams: {} as any,
        postActions: { notification: true, autoExport: false, exportPath: null }
      }

      prisma.crawlerSchedule.create.mockResolvedValue({
        ...mockSchedule,
        type: 'CRON',
        cronExpression: '0 0 * * *'
      })

      const result = await service.create(createDto)

      expect(result.type).toBe('CRON')
      expect(prisma.crawlerSchedule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'CRON',
            cronExpression: '0 0 * * *',
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('postActions를 JSON 문자열로 직렬화해야 한다', async () => {
      const createDto: CreateScheduleDto = {
        name: '테스트',
        type: 'DAILY',
        cronExpression: null,
        time: '09:00',
        weekdays: null,
        dayOfMonth: null,
        enabled: true,
        crawlerParams: {} as any,
        postActions: {
          notification: true,
          autoExport: true,
          exportPath: '/path/to/export'
        }
      }

      prisma.crawlerSchedule.create.mockResolvedValue(mockSchedule)

      await service.create(createDto)

      expect(prisma.crawlerSchedule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            postActions: '{"notification":true,"autoExport":true,"exportPath":"/path/to/export"}'
          })
        })
      )
    })
  })

  describe('update', () => {
    it('기본 정보(name, enabled)를 업데이트해야 한다', async () => {
      const updateDto: UpdateScheduleDto = {
        name: '수정된 이름',
        enabled: false
      }

      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue({
        ...mockSchedule,
        name: '수정된 이름',
        enabled: false
      })

      const result = await service.update('test-id-1', updateDto)

      expect(result.name).toBe('수정된 이름')
      expect(result.enabled).toBe(false)
      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id-1' },
          data: expect.objectContaining({
            name: '수정된 이름',
            enabled: false
          })
        })
      )
    })

    it('스케줄 타입 변경 시 nextRunAt을 재계산해야 한다', async () => {
      const updateDto: UpdateScheduleDto = {
        type: 'WEEKLY',
        weekdays: '[1,2,3]'
      }

      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue({
        ...mockSchedule,
        type: 'WEEKLY',
        weekdays: '[1,2,3]'
      })

      await service.update('test-id-1', updateDto)

      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'WEEKLY',
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('시간 변경 시 nextRunAt을 재계산해야 한다', async () => {
      const updateDto: UpdateScheduleDto = {
        time: '15:30'
      }

      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue({
        ...mockSchedule,
        time: '15:30'
      })

      await service.update('test-id-1', updateDto)

      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            time: '15:30',
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('시간 변경이 없으면 nextRunAt을 유지해야 한다', async () => {
      const updateDto: UpdateScheduleDto = {
        name: '이름만 변경'
      }

      const originalNextRunAt = mockSchedule.nextRunAt
      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue({
        ...mockSchedule,
        name: '이름만 변경'
      })

      await service.update('test-id-1', updateDto)

      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nextRunAt: originalNextRunAt
          })
        })
      )
    })

    it('존재하지 않는 ID로 NotFoundException을 발생시켜야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(null)

      await expect(service.update('non-existent-id', { name: '테스트' })).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('delete', () => {
    it('스케줄을 삭제해야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)
      prisma.crawlerSchedule.delete.mockResolvedValue(mockSchedule)

      await service.delete('test-id-1')

      expect(prisma.crawlerSchedule.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-1' }
      })
    })

    it('존재하지 않는 ID로 NotFoundException을 발생시켜야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(null)

      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('toggleEnabled', () => {
    it('enabled=true를 false로 토글해야 한다', async () => {
      const enabledSchedule = { ...mockSchedule, enabled: true }
      prisma.crawlerSchedule.findUnique.mockResolvedValue(enabledSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue({ ...enabledSchedule, enabled: false })

      const result = await service.toggleEnabled('test-id-1')

      expect(result.enabled).toBe(false)
      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        data: { enabled: false }
      })
    })

    it('enabled=false를 true로 토글해야 한다', async () => {
      const disabledSchedule = { ...mockSchedule, enabled: false }
      prisma.crawlerSchedule.findUnique.mockResolvedValue(disabledSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue({ ...disabledSchedule, enabled: true })

      const result = await service.toggleEnabled('test-id-1')

      expect(result.enabled).toBe(true)
      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        data: { enabled: true }
      })
    })

    it('존재하지 않는 ID로 NotFoundException을 발생시켜야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(null)

      await expect(service.toggleEnabled('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('calculateNextRun', () => {
    it('DAILY 타입: 매일 지정된 시간에 실행되어야 한다', () => {
      const schedule = {
        type: 'DAILY' as const,
        time: '14:30',
        cronExpression: null,
        weekdays: null,
        dayOfMonth: null
      }

      const result = service.calculateNextRun(schedule)

      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it('WEEKLY 타입: 지정된 요일의 지정된 시간에 실행되어야 한다', () => {
      const schedule = {
        type: 'WEEKLY' as const,
        time: '10:00',
        cronExpression: null,
        weekdays: '[1,3,5]', // 월, 수, 금
        dayOfMonth: null
      }

      const result = service.calculateNextRun(schedule)

      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(0)
      expect([1, 3, 5]).toContain(result.getDay())
    })

    it('MONTHLY 타입: 매월 지정된 날짜의 지정된 시간에 실행되어야 한다', () => {
      const schedule = {
        type: 'MONTHLY' as const,
        time: '09:00',
        cronExpression: null,
        weekdays: null,
        dayOfMonth: 15
      }

      const result = service.calculateNextRun(schedule)

      expect(result).toBeInstanceOf(Date)
      expect(result.getDate()).toBe(15)
      expect(result.getHours()).toBe(9)
      expect(result.getMinutes()).toBe(0)
    })

    it('CRON 타입: CRON 표현식 기반으로 실행되어야 한다', () => {
      const schedule = {
        type: 'CRON' as const,
        time: '00:00',
        cronExpression: '0 12 * * *', // 매일 12시
        weekdays: null,
        dayOfMonth: null
      }

      const result = service.calculateNextRun(schedule)

      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(12)
      expect(result.getMinutes()).toBe(0)
    })

    it('잘못된 CRON 표현식으로 에러를 발생시켜야 한다', () => {
      const schedule = {
        type: 'CRON' as const,
        time: '00:00',
        cronExpression: 'invalid-cron',
        weekdays: null,
        dayOfMonth: null
      }

      expect(() => service.calculateNextRun(schedule)).toThrow('CRON 표현식이 유효하지 않습니다')
    })

    it('알 수 없는 타입으로 에러를 발생시켜야 한다', () => {
      const schedule = {
        type: 'UNKNOWN' as any,
        time: '00:00',
        cronExpression: null,
        weekdays: null,
        dayOfMonth: null
      }

      expect(() => service.calculateNextRun(schedule)).toThrow('알 수 없는 스케줄 타입')
    })
  })

  describe('updateNextRun', () => {
    it('다음 실행 시간을 업데이트해야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(mockSchedule)
      prisma.crawlerSchedule.update.mockResolvedValue(mockSchedule)

      await service.updateNextRun('test-id-1')

      expect(prisma.crawlerSchedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id-1' },
          data: expect.objectContaining({
            nextRunAt: expect.any(Date)
          })
        })
      )
    })

    it('존재하지 않는 ID로 NotFoundException을 발생시켜야 한다', async () => {
      prisma.crawlerSchedule.findUnique.mockResolvedValue(null)

      await expect(service.updateNextRun('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })
})

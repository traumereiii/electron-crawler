import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { CollectSession, CollectTask } from '@/types'

@Injectable()
export class CollectHistoryService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  public async getSessions(): Promise<CollectSession[]> {
    const sessions = await this.prismaService.collectSession.findMany({
      orderBy: { startedAt: 'desc' }
    })
    return sessions.map((session) => ({
      id: session.id,
      entryUrl: session.entryUrl,
      executionType: session.executionType,
      startedAt: session.startedAt.toISOString().slice(0, -1),
      finishedAt: session.finishedAt?.toISOString().slice(0, -1),
      totalTasks: Number(session.totalTasks),
      successTasks: Number(session.successTasks),
      failedTasks: Number(session.failedTasks),
      status: session.status
    }))
  }

  public async getTasks(sessionId?: string): Promise<CollectTask[]> {
    const tasks = await this.prismaService.collectTask.findMany({
      where: { sessionId },
      orderBy: { startedAt: 'desc' }
    })
    return tasks.map((task) => ({
      id: task.id,
      sessionId: task.sessionId,
      parentId: task.parentId,
      url: task.url,
      success: task.success,
      screenshot: task.screenshot,
      startedAt: task.startedAt.toISOString().slice(0, -1),
      spentTimeOnNavigateInMillis: Number(task.spentTimeOnNavigateInMillis),
      spentTimeOnPageLoadedInMillis: Number(task.spentTimeOnPageLoadedInMillis),
      error: task.error,
      errorType: task.errorType
    }))
  }

  public async getParsings(sessionId?: string) {
    const parsings = await this.prismaService.parsing.findMany({
      select: {
        id: true,
        collectTaskId: true,
        url: true,
        html: true,
        success: true,
        error: true,
        errorType: true,
        createdAt: true,
        collectTask: {
          select: {
            sessionId: true
          }
        }
      },
      where: sessionId ? { collectTask: { sessionId } } : {},
      orderBy: { createdAt: 'desc' }
    })
    return parsings.map((parsing) => ({
      id: parsing.id,
      collectTask: parsing.collectTaskId,
      url: parsing.url,
      html: parsing.html,
      success: parsing.success,
      error: parsing.error,
      errorType: parsing.errorType,
      createdAt: parsing.createdAt.toISOString().slice(0, -1)
    }))
  }

  public async getStocksBySession(sessionId: string) {
    const stocks = await this.prismaService.stock.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' }
    })
    // BigInt를 문자열로 변환 (IPC 직렬화를 위해)
    return stocks.map((stock) => ({
      ...stock,
      volume: stock.volume.toString(),
      tradingValue: stock.tradingValue.toString(),
      marketCap: stock.marketCap.toString(),
      per: stock.per.toString(),
      eps: stock.eps.toString(),
      pbr: stock.pbr.toString()
    }))
  }

  public async getStocksByCollectTask(collectTaskId: string) {
    const stocks = await this.prismaService.stock.findMany({
      where: { collectTaskId },
      orderBy: { createdAt: 'desc' }
    })
    // BigInt를 문자열로 변환 (IPC 직렬화를 위해)
    return stocks.map((stock) => ({
      ...stock,
      volume: stock.volume.toString(),
      tradingValue: stock.tradingValue.toString(),
      marketCap: stock.marketCap.toString(),
      per: stock.per.toString(),
      eps: stock.eps.toString(),
      pbr: stock.pbr.toString()
    }))
  }
}

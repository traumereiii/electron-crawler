import { Parser } from '@main/parser/parser'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { ParsingRequest } from '@main/parser/types'
import { load as cheerioLoad } from 'cheerio'

@Injectable()
export class NaverStockParser extends Parser {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {
    super(prismaService)
  }

  async parse(request: ParsingRequest): Promise<void> {
    try {
      // do something
      const $ = cheerioLoad(request.html)
      const name = $('div.wrap_company a').text()
      const per = $('#_per').text()
      const eps = $('#_eps').text()
      const pbr = $('#_pbr').text()

      // 파싱 및 저장
      console.log({
        name: name?.trim(),
        per: per?.trim(),
        eps: eps?.trim(),
        pbr: pbr?.trim()
      })

      this.successHistory(request)
    } catch (e) {
      this.failHistory(request, e as Error, 'UNKNOWN_ERROR')
    }
  }
}

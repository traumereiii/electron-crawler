import { Parser } from '@main/parser/parser'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { ParsingRequest } from '@main/parser/types'
import type { CheerioAPI } from 'cheerio'
import { sendData } from '@main/controller/crawler.controller'
import { koreanUnitToNumber, parseNumberWithComma } from '@main/lib/utils'

@Injectable()
export class NaverStockParser extends Parser {
  constructor(@Inject(PrismaService) private readonly _prismaService: PrismaService) {
    super(_prismaService)
  }

  async parse($: CheerioAPI, request: ParsingRequest): Promise<void> {
    const code = request.url.substringAfter('code=')
    console.log('parser check: ', request.url, code)
    const name = $('div.wrap_company a').text()
    // replace all space and newline and comma
    const price = parseNumberWithComma($('#rate_info_krx .no_today').text().replace(/\s+/g, ''))
    const volume = parseNumberWithComma(
      $('#rate_info_krx table.no_info .sp_txt9').siblings('em').text()
    )

    const tradingValue =
      parseNumberWithComma($('#rate_info_krx table.no_info .sp_txt10').siblings('em').text()) *
      koreanUnitToNumber($('#rate_info_krx table.no_info .sp_txt11').text())

    const per = $('#_per').text()
    const eps = $('#_eps').text()
    const pbr = $('#_pbr').text()

    // 파싱 및 저장

    if (code) {
      const stock = await this._prismaService.stock.upsert({
        where: { code },
        create: {
          code,
          name: name,
          price: price,
          volume: volume,
          tradingValue: tradingValue,
          marketCap: 0,
          per: parseFloat(per?.replace(/,/g, '') || '0'),
          eps: parseFloat(eps?.replace(/,/g, '') || '0'),
          pbr: parseFloat(pbr?.replace(/,/g, '') || '0')
        },
        update: {
          per: parseFloat(per?.replace(/,/g, '') || '0'),
          eps: parseFloat(eps?.replace(/,/g, '') || '0'),
          pbr: parseFloat(pbr?.replace(/,/g, '') || '0')
        }
      })

      sendData({
        code: stock.code,
        name: stock.name,
        price: price,
        volume: volume,
        tradingValue: tradingValue,
        marketCap: Number(stock.marketCap.toString()),
        per: Number(stock.per.toString()),
        eps: Number(stock.eps.toString()),
        pbr: Number(stock.pbr.toString())
      })
    }
  }
}

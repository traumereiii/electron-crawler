import { Parser } from '@main/parser/parser'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'
import { ParsingErrorType, ParsingRequest, ParsingResultInner } from '@main/parser/types'
import type { CheerioAPI } from 'cheerio'
import { koreanUnitToNumber, parseNumberWithComma } from '@main/lib/utils'
import { Stock } from '@main/generated/prisma/client'
import { Decimal } from '@prisma/client/runtime/client'

@Injectable()
export class NaverStockParser extends Parser<Omit<Stock, 'createdAt' | 'updatedAt'>> {
  constructor(@Inject(PrismaService) private readonly _prismaService: PrismaService) {
    super(_prismaService)
  }

  parse(
    $: CheerioAPI,
    request: ParsingRequest<Omit<Stock, 'createdAt' | 'updatedAt'>>
  ): ParsingResultInner<Omit<Stock, 'createdAt' | 'updatedAt'>> {
    const code = request.url.substringAfter('code=')

    const name = $('div.wrap_company a').text()

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
      return {
        success: true,
        data: {
          code,
          sessionId: request.sessionId,
          collectTaskId: request.taskId,
          name: name,
          price: price,
          volume: BigInt(volume),
          tradingValue: BigInt(tradingValue),
          marketCap: BigInt(0),
          per: Decimal(parseFloat(per?.replace(/,/g, '') || '0')),
          eps: Decimal(parseFloat(eps?.replace(/,/g, '') || '0')),
          pbr: Decimal(parseFloat(pbr?.replace(/,/g, '') || '0'))
        }
      }
    } else {
      return {
        success: false,
        errorType: ParsingErrorType.VALUE_NOT_FOUND,
        errorMessage: '주식 코드를 찾을 수 없습니다.'
      }
    }
  }
}

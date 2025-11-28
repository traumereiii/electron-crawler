import { Module } from '@nestjs/common'
import { NaverStockParser } from '@main/parser/naver-stock.parser'

@Module({
  providers: [NaverStockParser],
  exports: [NaverStockParser]
})
export class ParserModule {}

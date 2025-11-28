import { Global, Module } from '@nestjs/common'
import { PrismaService } from '@main/prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class GlobalModule {}

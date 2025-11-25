import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma.service'
import { UsersService } from './user.service'
import { ErrorHandler } from '@main/handler/error.handler'

@Module({
  imports: [],
  controllers: [],
  providers: [AppService, PrismaService, UsersService, ErrorHandler]
})
export class AppModule {}

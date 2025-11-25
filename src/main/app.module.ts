import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma.service'
import { UsersService } from './user.service'

@Module({
  imports: [],
  controllers: [],
  providers: [AppService, PrismaService, UsersService]
})
export class AppModule {}

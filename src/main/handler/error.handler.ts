import { Injectable, Logger } from '@nestjs/common'
import { IpcMainError, IpcRendererError } from '@/types'

@Injectable()
export class ErrorHandler {
  private readonly logger = new Logger(ErrorHandler.name)

  handleMainError({ channel, error, args }: IpcMainError) {
    this.logger.log(
      `Main Error on channel ${channel} with params ${JSON.stringify(args)}: ${error?.message ?? error}`
    )
  }

  handleRendererError({ channel, error, args }: IpcRendererError) {
    this.logger.log(
      `Renderer Error on channel ${channel} with params ${JSON.stringify(args)}: ${error?.message ?? error}`
    )
  }
}

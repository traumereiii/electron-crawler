import { Injectable, Logger } from '@nestjs/common'
import { IpcMainError, IpcRendererError } from '@/types'
import { mainWindow } from '@/main'
import { IPC_KEYS } from '@/lib/constant'

@Injectable()
export class ErrorHandler {
  private readonly logger = new Logger(ErrorHandler.name)

  handleMainError({ channel, error, args }: IpcMainError) {
    this.logger.error(
      `[에러] 메인 에러 [channel=${channel}, params=${JSON.stringify(args)}] [${error.stack}]`
    )

    mainWindow.webContents.send(IPC_KEYS.event.system, {
      message: '작업 중 에러가 발생 했습니다.'
    })
  }

  handleRendererError({ channel, error, args }: IpcRendererError) {
    this.logger.error(
      `[에러] 렌더러 에러 [channel=${channel}, params=${JSON.stringify(args)}] [${error.stack}]`
    )
  }
}

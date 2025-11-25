// // src/common/filters/global-exception.filter.ts
// import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
//
// @Catch() // 모든 예외 캐치
// export class GlobalExceptionFilter implements ExceptionFilter {
//   private readonly logger = new Logger(GlobalExceptionFilter.name)
//
//   catch(exception: unknown, host: ArgumentsHost) {
//     // 실행 컨텍스트 종류별로 분기 가능
//     const type = host.getType()
//
//     // if (type === 'http') {
//     //   const ctx = host.switchToHttp()
//     //   const response = ctx.getResponse()
//     //   const request = ctx.getRequest()
//     //
//     //   const status = exception instanceof HttpException ? exception.getStatus() : 500
//     //   const message =
//     //     exception instanceof HttpException
//     //       ? exception.getResponse()
//     //       : ((exception as any)?.message ?? 'Internal server error')
//     //
//     //   this.logger.error(
//     //     `[HTTP] ${request.method} ${request.url} -> ${status} ${JSON.stringify(message)}`,
//     //     (exception as any)?.stack
//     //   )
//     //
//     //   return response.status(status).json({
//     //     success: false,
//     //     statusCode: status,
//     //     message,
//     //     path: request.url,
//     //     timestamp: new Date().toISOString()
//     //   })
//     // }
//
//     // microservice / ws / rpc 등도 필요하면 추가 분기
//     console.log('error test: ', exception)
//     this.logger.error(
//       `[${type}] ${String((exception as any)?.message ?? exception)}`,
//       (exception as any)?.stack
//     )
//   }
// }

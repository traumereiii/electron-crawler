// src/common/interceptors/error.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { catchError, throwError } from 'rxjs'

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('ErrorLoggingInterceptor intercepting...', context)
    return next.handle().pipe(
      catchError((err) => {
        console.log('interceptor error:', err)
        const type = context.getType()
        this.logger.error(`[${type}] ${err?.message ?? err}`, err?.stack)
        return throwError(() => err) // 다시 던져서 필터가 마무리하게
      })
    )
  }
}

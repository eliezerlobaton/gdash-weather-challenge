import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; url: string }>();
    const { method, url } = request;
    const startTime = Date.now();

    this.logger.log(`Incomming Request: ${method} ${url}`);
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `Request completed: ${method} ${url} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duartion = Date.now() - startTime;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Request failed: ${method} ${url} - ${duartion}ms`,
            errorMessage,
          );
        },
      }),
    );
  }
}

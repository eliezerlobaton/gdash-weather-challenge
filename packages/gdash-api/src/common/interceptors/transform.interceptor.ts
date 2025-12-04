import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

export interface TransformResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        data,
        statusCode: context.switchToHttp().getResponse<Response>().statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

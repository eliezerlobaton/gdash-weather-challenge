import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({
          method: 'GET',
          url: '/test',
        }),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log incoming request', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(logSpy).toHaveBeenCalledWith('Incomming Request: GET /test');
        done();
      },
    });
  });

  it('should log request completion with duration', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Request completed: GET /test'),
        );
        done();
      },
    });
  });

  it('should log error on request failure', (done) => {
    const errorSpy = jest.spyOn(interceptor['logger'], 'error');
    const testError = new Error('Test error');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(
      throwError(() => testError),
    );

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      error: () => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Request failed: GET /test'),
          'Test error',
        );
        done();
      },
    });
  });
});

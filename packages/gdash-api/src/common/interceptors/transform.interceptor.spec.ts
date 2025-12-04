import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformInterceptor();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => ({
          statusCode: 200,
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

  it('should transform response with data, statusCode and timestamp', (done) => {
    const testData = { message: 'test' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({
          data: testData,
          statusCode: 200,
          timestamp: expect.any(String),
        });
        done();
      },
    });
  });

  it('should include correct statusCode from response', (done) => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => ({
          statusCode: 201,
        }),
      }),
    } as unknown as ExecutionContext;

    (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ id: 1 }));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value.statusCode).toBe(201);
        done();
      },
    });
  });

  it('should handle array data', (done) => {
    const testData = [1, 2, 3];
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value.data).toEqual(testData);
        done();
      },
    });
  });
});

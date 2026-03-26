import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { CarrierError } from './carrier-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'SERVER_ERROR';
    let carrier: string | undefined = undefined;
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || exception.message;
      code = 'HTTP_EXCEPTION';
    } else if (exception instanceof CarrierError) {
      if (exception.code === 'AUTH_FAILED') status = HttpStatus.UNAUTHORIZED;
      else if (exception.code === 'RATE_LIMITED') status = HttpStatus.TOO_MANY_REQUESTS;
      else if (exception.code === 'VALIDATION_ERROR') status = HttpStatus.BAD_REQUEST;
      else if (exception.code === 'TIMEOUT') status = HttpStatus.GATEWAY_TIMEOUT;
      else if (exception.code === 'PARSE_ERROR') status = HttpStatus.BAD_GATEWAY;
      else status = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      
      message = exception.message;
      code = exception.code;
      carrier = exception.carrier;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    const responseBody: any = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
    };
    if (carrier) {
      responseBody.carrier = carrier;
    }

    response.status(status).json(responseBody);
  }
}

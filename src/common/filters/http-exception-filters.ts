import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get the exception response
    const errorResponse = exception.getResponse();
    let errorMessage = exception.message;
    let errorDetails: any = null;

    // Check if error response is an object with message and/or details
    if (typeof errorResponse === 'object') {
      errorMessage = (errorResponse as any).message || errorMessage;
      errorDetails = (errorResponse as any).details || null;
    }

    this.logger.error(
      `${request.method} ${request.url} ${status}: ${errorMessage}`,
      errorDetails,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
      details: errorDetails,
    });
  }
}
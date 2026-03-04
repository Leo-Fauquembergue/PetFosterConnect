import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Log complet côté serveur
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${request.method}] ${request.url}`, exception instanceof Error ? exception.stack : exception);
    }

    // 🛡️ CORRECTION SÉCURITÉ : Ne jamais exposer la stack trace SQL/Prisma en production
    const isProduction = process.env.NODE_ENV === 'production';
    
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) 
        ? 'Une erreur interne est survenue sur le serveur.' 
        : message,
    };

    response.status(status).json(errorResponse);
  }
}
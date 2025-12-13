// ...existing code...
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Determine if we should show details to client
    const showDetails =
      process.env.NODE_ENV !== 'production' ||
      process.env.SHOW_ERROR_DETAILS === 'true';

    // If it's already an HttpException, use it directly
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      const normalized =
        typeof resp === 'string'
          ? { message: resp, statusCode: status }
          : { ...(resp as object), statusCode: status };

      this.logger.warn({ path: request?.url, status, normalized, exception });

      response.status(status).json({
        success: false,
        message: showDetails
          ? normalized
          : {
              message: normalized['message'] ?? HttpStatus[status],
              statusCode: status,
            },
      });
      return;
    }

    // Map known non-http errors to appropriate HttpExceptions
    let mappedException: HttpException;

    // TypeORM DB error handling
    if (exception instanceof QueryFailedError || (exception as any)?.code) {
      const qfe: any = exception;
      const driverError = qfe.driverError ?? qfe; // driverError property or the error itself
      const sqlCode = driverError?.code ?? (qfe as any).code;

      // Postgres unique violation
      if (sqlCode === '23505') {
        const detail = driverError?.detail ?? 'Unique constraint violation';
        mappedException = new ConflictException(detail);
      } else if (typeof sqlCode === 'string' && sqlCode.startsWith('22')) {
        // data exception class (Postgres 22xxx)
        mappedException = new BadRequestException(
          driverError?.message ?? 'Invalid data',
        );
      } else {
        mappedException = new InternalServerErrorException(
          driverError?.message ?? 'Database error',
        );
      }

      // Log full db error
      this.logger.error({
        path: request?.url,
        sqlCode,
        driverError,
        exception,
      });
    }
    // JWT errors (jsonwebtoken)
    else if (
      (exception as any)?.name === 'JsonWebTokenError' ||
      (exception as any)?.name === 'TokenExpiredError'
    ) {
      mappedException = new UnauthorizedException(
        (exception as any).message ?? 'Invalid token',
      );
      this.logger.warn({
        path: request?.url,
        error: (exception as any).name,
        message: (exception as any).message,
      });
    } else if ((exception as any)?.message) {
      const maybeStatus =
        (exception as any).status || (exception as any).statusCode;
      if (typeof maybeStatus === 'number') {
        mappedException = new HttpException(
          (exception as any).message,
          maybeStatus,
        );
      } else {
        // Non-db unexpected errors: return 500 but include message in details when allowed
        mappedException = new InternalServerErrorException(
          (exception as any).message,
        );
      }
      this.logger.error({
        path: request?.url,
        message: (exception as any).message,
        exception,
      });
    } else {
      // Fallback
      mappedException = new InternalServerErrorException(
        'Internal server error',
      );
      this.logger.error({ path: request?.url, exception });
    }

    const status = mappedException.getStatus();
    const respBody = mappedException.getResponse();
    let clientMessage: any;

    if (typeof respBody === 'string') {
      clientMessage = { message: respBody, statusCode: status };
    } else {
      clientMessage = { ...(respBody as object), statusCode: status };
    }

    if (!showDetails) {
      clientMessage = {
        message:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Internal server error'
            : (clientMessage.message ?? HttpStatus[status]),
        statusCode: status,
      };
    }

    response.status(status).json({
      success: false,
      message: clientMessage,
    });
  }
}

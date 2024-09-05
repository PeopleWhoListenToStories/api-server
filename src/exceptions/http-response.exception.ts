import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { errorLogger } from '~/logger/index'

@Catch(HttpException)
export class HttpResponseExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();
    // const url = request.originalUrl;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = {
      code: status,
      message: exception.message,
      success: false,
      data: null,
    };
    errorLogger.info(`[${response.req.method}] [${response.req.url}] [${status}] [${response.req.rawHeaders}] ${errorResponse}`);
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}

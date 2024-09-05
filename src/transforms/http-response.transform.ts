import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { infoLogger } from '~/logger/index'

interface Response<T> {
  data: T;
}

export function wrapResponse({ statusCode, data }) {
  return {
    code: statusCode,
    message: null,
    success: true,
    data,
  };
}

@Injectable()
export class HttpResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        infoLogger.info(`[${response.req.method}] [${response.req.url}] [${statusCode}] [${response.req.rawHeaders}] ${data}`)
        return wrapResponse({ data, statusCode });
      })
    );
  }
}

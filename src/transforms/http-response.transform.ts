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
        infoLogger.info(`HTTP [${statusCode}] [${response.req.method}] [${response.req.url}] [${response.req.rawHeaders}] ${JSON.stringify(data)}`)
        return wrapResponse({ data, statusCode });
      })
    );
  }
}

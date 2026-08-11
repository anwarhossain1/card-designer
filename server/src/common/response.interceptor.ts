import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { map, type Observable } from "rxjs";

/** Single response envelope so clients can rely on `{ data }` / `{ message }`. */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { data: T }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ data: T }> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}

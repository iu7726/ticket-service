import { ConsoleLogger, Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

@Injectable()
export class CustomLogger extends ConsoleLogger {

  constructor(private readonly cls: ClsService) {
    super();
  }

  log(message: any, context?: string) {
    const traceId = this.cls.get('traceId');
    super.log(`[${traceId || 'SYSTEM'}] ${message}`, ...(context ? [context] : []));
  }

  error(message: any, stack?: string, context?: string) {
    const traceId = this.cls.get('traceId');
    super.error(`[${traceId || 'SYSTEM'}] ${message}`, ...(stack ? [stack] : []), ...(context ? [context] : []));
  }

  debug(message: any, context?: string, ...rest: any[]) {
    const traceId = this.cls.get('traceId');
    super.debug(`[${traceId || 'SYSTEM'}] ${message}`, ...(context ? [context] : []), ...rest);
  }

  warn(message: any, context?: string, ...rest: any[]) {
    const traceId = this.cls.get('traceId');
    super.warn(`[${traceId || 'SYSTEM'}] ${message}`, ...(context ? [context] : []), ...rest);
  }

}
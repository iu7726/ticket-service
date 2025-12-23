import { ClsService } from "nestjs-cls";
import { AdvancedConsoleLogger, QueryRunner } from "typeorm";

export class TypeORMLogger extends AdvancedConsoleLogger {
  private readonly ignoreQueries = [
    'SELECT /*+ MAX_EXECUTION_TIME(1000) */ 1'
  ];

  constructor(private readonly cls: ClsService) {
    super('all');
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    if (this.ignoreQueries.includes(query)) return;

    const traceId = this.cls.get('traceId'); 
    const prefix = `[${traceId || 'SYSTEM'}] `;

    super.logQuery(`${prefix} ${query}`, parameters, queryRunner);
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    const traceId = this.cls.get('traceId'); 
    const prefix = `[${traceId || 'SYSTEM'}] `;

    super.logQueryError(`${prefix} ${error}`, query, parameters, queryRunner);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    const traceId = this.cls.get('traceId'); 
    const prefix = `[${traceId || 'SYSTEM'}] `;

    super.logQuerySlow(time, `${prefix} ${query}`, parameters, queryRunner);
  }

}
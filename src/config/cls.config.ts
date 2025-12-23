import { ClsModuleOptions } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express'; 

export const clsConfig: ClsModuleOptions = {
  global: true, 
  middleware: {
    mount: true, 
    generateId: true, 
    idGenerator: (req: Request) => {
      const existingId = req.headers['x-trace-id'] as string;
      if (existingId) return existingId;

      return uuidv4();
    },
    setup: (cls, req) => {
      cls.set('traceId', cls.getId()); 
    },
  },
};
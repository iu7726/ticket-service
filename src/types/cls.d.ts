import { ClsStore } from 'nestjs-cls';

declare module 'nestjs-cls' {
  interface ClsStore {
    traceId: string;
  }
}

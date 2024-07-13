import { Module } from '@nestjs/common';
import { SSEService } from './sse.service';
import { SSEController } from './sse.controller';

@Module({
  providers: [SSEService],
  controllers: [SSEController],
  exports: [SSEService],
})
export class SSEModule { }

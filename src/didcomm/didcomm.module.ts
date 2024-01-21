// filename: didcomm.module.ts
// location: src/didcomm
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { DidCommController } from './didcomm.controller.js';
import { VeramoAgentService } from './didcomm.service.js';
import { PlainTextMiddleware } from './utils/plain-text.middleware.js';

@Module({
  controllers: [DidCommController],
  providers: [VeramoAgentService],
})
export class DidCommModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlainTextMiddleware)
      .forRoutes({ path: 'didcomm/message', method: RequestMethod.POST });
  }
}

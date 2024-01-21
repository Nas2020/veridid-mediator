/* eslint-disable prettier/prettier */
//file: app.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createVeramoAgent } from './agent/setup.js';
import { DidCommModule } from './didcomm/didcomm.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DidCommController } from './didcomm/didcomm.controller.js';
import { VeramoAgentService } from './didcomm/didcomm.service.js';

@Global()
@Module({

  imports: [ConfigModule.forRoot({ isGlobal: true }), DidCommModule],
  controllers: [AppController, DidCommController],
  providers: [
    {
      provide: 'VERAMO_AGENT',
      useFactory: async (configService: ConfigService) => {
        const kmsSecretKey = configService.get<string>('KMS_SECRET_KEY');
        const fileName = configService.get<string>('DATABASE_FILE');
        return createVeramoAgent(kmsSecretKey, fileName);
      },
      inject: [ConfigService],
    }, AppService, VeramoAgentService
  ],
  exports: ['VERAMO_AGENT'],
})
export class AppModule { }

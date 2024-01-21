/* eslint-disable prettier/prettier */
//file: main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { checkOrCreateDID } from './agent/check-or-create-identifier.js';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const veramoAgent = app.get('VERAMO_AGENT');

    const swaggerTitle = configService.get<string>('SWAGGER_TITLE', 'VeriDID API');
    const swaggerDescription = configService.get<string>('SWAGGER_DESCRIPTION', 'The VeriDID API description');
    const swaggerVersion = configService.get<string>('SWAGGER_VERSION', '1.0');

    const alias = configService.get<string>('ALIAS');
    const agent_port = configService.get<string>('AGENT_PORT');
    const agent_endpoint = configService.get<string>('AGENT_ENDPOINT');
    const alias_peer = configService.get<string>('ALIAS_PEER');
    const alias_key = configService.get<string>('ALIAS_KEY');
    await checkOrCreateDID(veramoAgent, alias, alias_peer, alias_key, agent_endpoint);


    const swaggerConfig = new DocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(swaggerDescription)
      .setVersion(swaggerVersion)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    await app.listen(agent_port);
    console.log('Application started successfully');
  } catch (error) {
    console.error('Failed to initialize Veramo agent:', error);
    process.exit(1);
  }
}

bootstrap();

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv';
import { execSync } from 'child_process';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule
} from '@nestjs/swagger'
import * as fs from 'fs'

function getAllowedCorsOrigin() {
  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

    return configuredOrigins;
}

function isLoopbackOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  } catch(error) {
    return false;
  }
}

function getCommitHash(): string | null {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

async function bootstrap() {
  // Add uncaught exception handlers to prevent crashes
  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception', error.stack, 'Bootstrap');
    // Don't exit immediately, let the app try to recover
  });

  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection', String(reason), 'Bootstrap');
    // Don't exit immediately, let the app try to recover
  });

  const app = await NestFactory.create(AppModule);
  const operationIdCounts = new Map<string, number>();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_: string, methodKey: string) => {
      const baseId = methodKey;
      const nextCount = (operationIdCounts.get(baseId) ?? 0) + 1;
      operationIdCounts.set(baseId, nextCount);
      return nextCount === 1 ? baseId : `${baseId}${nextCount}`;
    },
  };

  const config = new DocumentBuilder()
    .addServer('http://localhost:4002', 'Local Ingestion Server')
    .setTitle('OpenRec Ingestion-Server')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(
    app as Parameters<typeof SwaggerModule.createDocument>[0],
    config,
    options,
  );
  if(process.env.GENERATE_DOCS) {
    fs.writeFileSync('./swagger-spec.json', JSON.stringify(document))
  }
  SwaggerModule.setup('api', app as Parameters<typeof SwaggerModule.createDocument>[0], document);

  app.getHttpAdapter().get('/openapi.json', (_, res) => {
    res.type('application/json').send(JSON.stringify(document));
  });
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableCircularCheck: true,
      excludePrefixes: ['__', '$'],
    }),
  );
  app.enableCors({
    origin: (requestOrgin: string, callback: (err: null, bool: Boolean) => void) => {
      if(!requestOrgin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = getAllowedCorsOrigin();
      if(
        allowedOrigins.includes(requestOrgin) ||
        isLoopbackOrigin(requestOrgin)
      ) {
        callback(null, true);
        return;
      }

      callback(null, false)
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  })

  await app.listen(Number.parseInt(process.env.PORT ?? '4002'));

  const commitHash = getCommitHash();
  if (commitHash) {
    Logger.log(`Server running on ${process.env.PORT} | Commit: ${commitHash}`);
  } else {
    Logger.log(`Server running on ${process.env.PORT}`);
  }
}
bootstrap();

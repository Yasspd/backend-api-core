import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { PrismaService } from './modules/prisma/prisma.service';

// Глобальный патч: учим JSON.stringify сериализовать числа типа BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap(): Promise<void> {
  // 1. Отключаем дефолтный body-parser NestJS на уровне создания приложения
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  
  // 2. Увеличиваем лимиты встроенного парсера Express до 50 МБ
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  const port = configService.get<number>('PORT') ?? 3000;

  // Настройка CORS для безопасной связи с расширением и дашбордом
  app.enableCors({ origin: true, credentials: true });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await prismaService.enableShutdownHooks(app);
  await app.listen(port);

  Logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();

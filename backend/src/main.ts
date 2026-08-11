import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: [
      process.env.ADMIN_PANEL_URL || 'http://localhost:5173',
      process.env.FLUTTER_APP_URL || 'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://easyservice.tech',
      'https://www.easyservice.tech',
      'https://arslan-services-admin-pannel.vercel.app',
    ],
    credentials: true,
  });

  // Global prefix removed — controllers define their own /api prefix

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Arslan Services API running on port ${port}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();

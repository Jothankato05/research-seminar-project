import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Middleware
  app.use(helmet());
  app.use(cookieParser());

  // CSRF Protection disabled in development - enable in production with proper cookie options
  // Note: CSRF protection requires cookies to be set up properly with SameSite and Secure flags
  // For development with separate frontend/backend, this blocks API requests
  // if (process.env.NODE_ENV === 'production') {
  //   const csurf = require('csurf');
  //   app.use(csurf({ cookie: true }));
  // }

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Request Size Limits (default is 100kb in NestJS/Express, but we can be explicit if needed)
  // app.use(json({ limit: '100kb' })); // Already default

  // Enable CORS - support multiple frontend ports during development
  app.enableCors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

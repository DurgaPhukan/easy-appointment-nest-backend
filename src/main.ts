import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception-filters';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global middleware
  app.use(compression());
  app.use(helmet());
  app.enableCors();

  // Global pipes, filters, and interceptors
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Doctor Appointment Booking API')
    .setDescription('API for doctor appointment booking application')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('doctors')
    .addTag('patients')
    .addTag('organizations')
    .addTag('appointments')
    .addTag('diseases')
    .addTag('treatments')
    .addTag('billing')
    .addTag('feedback')
    .addTag('notifications')
    .addTag('messaging')
    .addTag('analytics')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
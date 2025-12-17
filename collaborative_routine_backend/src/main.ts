import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173','http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })
  const config = new DocumentBuilder()
    .setTitle('Collaborative Routine API')
    .setDescription(
      'API documentation for authentication and collaboration features',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('groups', 'Group management endpoints')
    .addTag('routines', 'Routine templates and group routines')
    .addBearerAuth()
    .build();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.setGlobalPrefix('api');
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Server running at http://localhost:${port}/api`,
    'NestApplication',
  );
  Logger.log(`📚 Swagger available at http://localhost:${port}/docs`, 'Swagger');
}
bootstrap();

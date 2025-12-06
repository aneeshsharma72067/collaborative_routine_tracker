import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Collaborative Routine API')
    .setDescription(
      'API documentation for authentication and collaboration features',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Server running at http://localhost:${port}`,
    'NestApplication',
  );
  Logger.log(`📚 Swagger available at http://localhost:${port}/api`, 'Swagger');
}
bootstrap();

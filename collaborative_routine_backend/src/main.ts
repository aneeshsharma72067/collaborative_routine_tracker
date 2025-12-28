import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173','http://localhost:3001','http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })
  const config = new DocumentBuilder()
    .setTitle('Team Rituals & Health API')
    .setDescription(
      'Multi-tenant platform for managing workspaces, rituals, and team sentiment.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User profile endpoints')
    .addTag('workspaces', 'Workspace lifecycle and membership')
    .addTag('teams', 'Team management workflows')
    .addTag('rituals', 'Team ritual configuration and status')
    .addTag('sessions', 'Scheduled ritual session lifecycle')
    .addTag('responses', 'Member ritual submissions')
    .addTag('sentiment', 'Weekly team sentiment tracking')
    .addTag('dashboard', 'Workspace-level health metrics')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer', 
    )
    .addSecurityRequirements('bearer')

    .build();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.setGlobalPrefix('api');
  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  Logger.log(
    `🚀 Server running at http://localhost:${port}/api`,
    'NestApplication',
  );
  Logger.log(`📚 Swagger available at http://localhost:${port}/docs`, 'Swagger');
}
bootstrap();

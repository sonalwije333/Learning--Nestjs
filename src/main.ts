import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: false, // Disable whitelist
    forbidNonWhitelisted: false, // Disable strict validation
    transform: true,
    skipMissingProperties: false,
    disableErrorMessages: false,
    validationError: { target: false } // Disable showing validation errors
  })
);

  
  // Swagger config
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE')!)
    .setDescription(configService.get('SWAGGER_DESCRIPTION')!)
    .setVersion(configService.get('SWAGGER_VERSION')!)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name is an identifier that will be used in @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server is running at: http://localhost:${port}`);
  console.log(`📄 Swagger docs available at: http://localhost:${port}/api`);
}
bootstrap();
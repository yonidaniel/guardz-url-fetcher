import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all routes
  app.enableCors();
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Swagger setup at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Guardz URL Fetcher Service')
    .setDescription('API for submitting URLs to fetch and viewing results')
    .setVersion('1.0')
    .addTag('urls')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`🚀 URL Fetcher Service is running on port ${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
  console.log(`📘 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();

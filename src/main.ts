import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all routes
  app.enableCors();
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`🚀 URL Fetcher Service is running on port ${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
}
bootstrap();

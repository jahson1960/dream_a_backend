
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*', // allow all (for testing only)
  });

  //await app.listen(3000); for DEV
  await app.listen(process.env.PORT || 3000, '0.0.0.0'); // FOR PRODUCTION

}
bootstrap();


